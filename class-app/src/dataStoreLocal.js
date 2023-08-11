import localforage from "localforage";

export async function setLocalStorage(data) {
  await fakeNetwork();
  await set("Employees", data);
}

export async function syncDatabases() {
  await fakeNetwork();

  const isEmployeeCacheAvailable = await checkCacheQueue("EmployeeCache");
  const isUpdateCacheAvailable = await checkCacheQueue("UpdateCache");
  const isDeleteCacheAvailable = await checkCacheQueue("DeleteCache");

  if (isEmployeeCacheAvailable) {
    const employees = await localforage.getItem("EmployeeCache");
    const employeePromises = employees.map(entry =>
      fetch("/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: entry.id,
          name: entry.name,
          title: entry.title,
          avatarurl: encodeURIComponent(entry.avatarurl)
        })
      })
      // console.log(`id: ${entry.id}, name: ${entry.name}, title: ${entry.title}, avatarurl: ${encodeURIComponent(entry.avatarurl)}`)
    );
    await Promise.all(employeePromises);
  } 
  
  if (isUpdateCacheAvailable) {
    const updatedEmployees = await localforage.getItem("UpdateCache");
    const updatePromises = updatedEmployees.map(entry =>
      fetch(`/update/${entry.ogId}/${entry.id}/${entry.name}/${entry.title}/${encodeURIComponent(entry.avatarurl)}/${entry.isactive}`, {
        method: "PUT"
      })
      // console.log(`ogId: ${entry.ogId}, id: ${entry.id}, name: ${entry.name}, title: ${entry.title}, avatarurl: ${encodeURIComponent(entry.avatarurl)}, isactive: ${entry.isactive}`)
    );
    await Promise.all(updatePromises);
  } 
  
  if (isDeleteCacheAvailable) {
    const deletedEmployees = await localforage.getItem("DeleteCache");
    const deletePromises = deletedEmployees.map(id =>
      fetch(`/delete/${id}`, {
        method: "DELETE"
      })
      // console.log(`id: ${id}`)
    );
    await Promise.all(deletePromises);
  }

  await set("CacheCheck", false);
  await set("EmployeeCache", []);
  await set("UpdateCache", []);
  await set("DeleteCache", []);
}

export async function getDataQuery() {
  await fakeNetwork(`get all: employees`);
  let data = await localforage.getItem("Employees");
  if (!data) data = [];
  return data;
}

export async function createData(data) {
  await fakeNetwork();
  let entries = await localforage.getItem("Employees");
  entries.push(data);
  await set("Employees", entries);
  let cacheData;
  await localforage.getItem("EmployeeCache")
  .then((value) => {
    if (value === null || value.length === 0) {
      cacheData = [data];
    } else {
      cacheData = [...value, data];
    }
  })
  await set("CacheCheck", true);
  await set("EmployeeCache", cacheData);
}

export async function getDataName(name) {
  await fakeNetwork(`Get employees: with name ${name}`);
  let employees = await localforage.getItem("Employees");
  let data = employees.filter((obj) =>
  Object.entries(obj).some(([key, value]) =>
    typeof value === 'string' && value.includes(name)));
  return data ?? null;
}

export async function updateData(data) {
  console.log(data);
  await fakeNetwork();
  let employees = await localforage.getItem("Employees");
  const updatedData = employees.map(item => {
    if (item.id === data.ogId) {
      return { id: data.id, name: data.name, title: data.title, avatarurl: data.avatarurl, isactive: data.isactive };
    }
    return item; 
  });

  await set("Employees", updatedData);
  let updateCache;
  await localforage.getItem("UpdateCache")
      .then((value) => {
        if (value === null || value.length === 0) {
          updateCache = [data];
        } else {
          updateCache = [...value, data];
        }
      })
  await set("UpdateCache", updateCache);
  await set("CacheCheck", true);
}

export async function deleteData(id) {
  let data = await localforage.getItem("Employees");
  let cacheData = await localforage.getItem("EmployeeCache");
  const isInChache = cacheData.some(item => item.id === id);
  if (isInChache) {
    const newCacheData = cacheData.filter(item => item.id !== id);
    await set("EmployeeCache", newCacheData);
    const check = await checkCacheQueue("all");
    await set("CacheCheck", check);
  } else {
    let deletedCache;
    await localforage.getItem("DeleteCache")
      .then((value) => {
        if (value === null || value.length === 0) {
          deletedCache = [id];
        } else {
          deletedCache = [...value, id];
        }
      })
    await set("CacheCheck", true);
    await set("DeleteCache", deletedCache)
  }
  const newData = data.filter(item => item.id !== id);
  await set("Employees", newData);
  return true;
}

function set(table,datas) {
  return localforage.setItem(table, datas);
}

async function checkCacheQueue(table) {
  let cacheTables;
  if (table === "all") {
    cacheTables = ["EmployeeCache", "DeleteCache", "UpdateCache"]
  } else {
    cacheTables = [table]
  }
  
  let status = false;
  for (let table of cacheTables) {
    await localforage.getItem(table)
      // eslint-disable-next-line no-loop-func
      .then((value) => {
        if (value !== null && value.length > 0) {
          status = true;
      }})
    }
    return status;
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache = {};

async function fakeNetwork(key) {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise(res => {
    setTimeout(res, Math.random() * 800);
  });
}