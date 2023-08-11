import * as React from 'react';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import Pagination from '@mui/material/Pagination';
import EmployeeCard from "./employeecard";
import Alert from '@mui/material/Alert';
import Fade from "@mui/material/Fade";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {
    getDataQuery,
    createData,
    getDataName,
    setLocalStorage,
    syncDatabases,
  } from "./dataStoreLocal";

const SearchTextField = styled(TextField)({
    '& .MuiInputLabel-root': {
        color: '#05AFF2',
    },
    '& label.Mui-focused': {
      color: '#05AFF2',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#B2BAC2',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#048ABF',
      },
    '& .MuiOutlinedInput-input': {
    color: 'white',
    },
      '&:hover fieldset': {
        borderColor: '#048ABF',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#048ABF',
      },
    },
  });

export default function EmployeeFinder() {
    const [open, setOpen] = React.useState(false);
    const [employees, setEmployees] = React.useState([[]]);
    const [activeEmployees, setActiveEmployees] = React.useState([[]]);
    const [allEmployees, setAllEmployees] = React.useState([[]]);
    const [newId, setNewId] = React.useState(0)
    const [newName, setNewName] = React.useState("")
    const [newTitle, setNewTitle] = React.useState("")
    const [newAvatar, setNewAvatar] = React.useState("")
    const [avatarDisplay, setAvatarDisplay] = React.useState("https://api.dicebear.com/6.x/notionists/svg?seed=$default")
    const [search, setSearch] = React.useState('');
    const [alertVisibility, setAlertVisibility] = React.useState(false);
    const [alertContent, setAlertContent] = React.useState('');
    const [gridVisibility, setGridVisibility] = React.useState(false);
    const [alertContentMain, setAlertContentMain] = React.useState('');
    const [alertTypeMain, setAlertTypeMain] = React.useState('');
    const [alertVisibilityMain, setAlertVisibilityMain] = React.useState(false);
    const [alertContentSecondary, setAlertContentSecondary] = React.useState('');
    const [alertTypeSecondary, setAlertTypeSecondary] = React.useState('');
    const [alertVisibilitySecondary, setAlertVisibilitySecondary] = React.useState(false);
    const [inactiveToggle, setInactiveToggle] = React.useState(false);
    const [page, setPage] = React.useState(0)
    const [trigger, setTrigger] = React.useState(0)

    const handleClickOpen = () => {
        setNewId(0)
        setNewName("")
        setNewTitle("")
        setNewAvatar("")
        setAvatarDisplay("https://api.dicebear.com/6.x/notionists/svg?seed=$default")
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleInactiveToggle = (event) => {
        setInactiveToggle(event.target.checked);
        if (event.target.checked && gridVisibility === true) {
            setEmployees(paginateData(allEmployees))
        } else if (!event.target.checked && gridVisibility === true) {
            setEmployees(paginateData(activeEmployees))
        }
    }

    const handleFetchAll = () => {
        fetchAll()
    }

    const paginateData = (data) => {
        let pageCount = 0
        let entryCount = 0
        let employeeList = [[]]
        for (let entry of data) {
            employeeList[pageCount].push(entry)
            entryCount++
            if (entryCount >= 8) {
                pageCount++
                entryCount = 0
                employeeList.push([])
            }
        }
        if (employeeList[employeeList.length - 1].length === 0) {
            employeeList.pop()
        }
        if (page > employeeList.length - 1) {
            setPage(employeeList.length - 1)
        }

        return employeeList
    }

    const fetchAll = () => {
        if (navigator.onLine) {
            syncDatabases()
                .then(() => {
                    fetch("/employees")
                        .then((response) => response.json())
                        .then(data => {
                            data.sort((a, b) => a.id - b.id);
                            setActiveEmployees(data.filter(employee => employee.isactive === true))
                            setAllEmployees(data)

                            let employeeList;
                            if (inactiveToggle) {
                                employeeList = paginateData(data)
                                
                            } else {
                                employeeList = paginateData(data.filter(employee => employee.isactive === true))
                            }

                            setEmployees(employeeList);
                            setLocalStorage(data);
                            setTrigger(trigger + 1);
                            
                            if (employeeList.length > 0) {
                                setGridVisibility(true)
                                setAlertContentMain("All employees were successfully loaded.")
                                setAlertTypeMain("success")
                                setAlertVisibilityMain(true)
                            } else {
                                setGridVisibility(false)
                                setAlertContentMain("There are no Employees in the database.")
                                setAlertTypeMain("error")
                                setAlertVisibilityMain(true)
                            }
                    });
                });
        } else {
            getDataQuery()
                .then(data => {
                    data.sort((a, b) => a.id - b.id);
                    setActiveEmployees(data.filter(employee => employee.isactive === true))
                    setAllEmployees(data)
                    
                    let employeeList;
                        if (inactiveToggle) {
                            employeeList = paginateData(data)
                            
                        } else {
                            employeeList = paginateData(data.filter(employee => employee.isactive === true))
                        }

                    setEmployees(employeeList);
                    setTrigger(trigger + 1);
                    
                    if (employeeList.length > 0) {
                        setGridVisibility(true)
                        setAlertContentMain("All employees were successfully loaded.")
                        setAlertTypeMain("success")
                        setAlertVisibilityMain(true)
                    } else {
                        setGridVisibility(false)
                        setAlertContentMain("There are no Employees in the database.")
                        setAlertTypeMain("error")
                        setAlertVisibilityMain(true)
                    }
                });
        }
    }

    const findHandle = () => {
        if (navigator.onLine) {
            fetch(`/employees/name?name=${search}`)
                .then((response) => response.json())
                .then(data => {
                    let employeeList;
                        if (inactiveToggle) {
                            employeeList = paginateData(data)
                            
                        } else {
                            employeeList = paginateData(data.filter(employee => employee.isactive === true))
                        }

                    setEmployees(employeeList);
                    setTrigger(trigger + 1);

                    setEmployees(employeeList);
                    setTrigger(trigger + 1);

                    if (data.length > 0) {
                        setGridVisibility(true)
                        setAlertContentMain(`${data.length} employees were found matching the search terms.`)
                        setAlertTypeMain("success")
                        setAlertVisibilityMain(true)
                    } else {
                        setGridVisibility(false)
                        setAlertContentMain(`No employees were found matching the search terms.`)
                        setAlertTypeMain("error")
                        setAlertVisibilityMain(true)
                    }
                });
        } else {
            getDataName(search)
                .then(data => {
                    let employeeList;
                        if (inactiveToggle) {
                            employeeList = paginateData(data)
                            
                        } else {
                            employeeList = paginateData(data.filter(employee => employee.isactive === true))
                        }

                    setEmployees(employeeList);
                    setTrigger(trigger + 1);

                    setEmployees(employeeList);
                    setTrigger(trigger + 1);

                    if (data.length > 0) {
                        setGridVisibility(true)
                        setAlertContentMain(`${data.length} employees were found matching the search terms.`)
                        setAlertTypeMain("success")
                        setAlertVisibilityMain(true)
                    } else {
                        setGridVisibility(false)
                        setAlertContentMain(`No employees were found matching the search terms.`)
                        setAlertTypeMain("error")
                        setAlertVisibilityMain(true)
                    }
                });
        }
    }

    const isIdUnique = (id) => {
        console.log(allEmployees.length)
        if (allEmployees.length === 1) {
            fetch("/employees")
            .then((response) => response.json())
            .then(data => {
                setAllEmployees(data)
                return data.every(entry => entry.id !== id);
            })
        } else {
            return allEmployees.every(entry => entry.id !== id);
        }
    }

    const save = () => {
        if(!(isNaN(newId)) && 
        newId > 0 && 
        newName !== "" && 
        newName.length < 25 &&
        newTitle !== "" &&
        newTitle.length < 25 &&
        newAvatar !== "") {
            if (isIdUnique(parseInt(newId))) {
                let safeName = newName.replace("'","''");
                let safeTitle = newTitle.replace("'","''");
                let safeAvatar = newAvatar.replace("'","''");
                if (navigator.onLine) {
                    fetch("/add", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({id: newId, name: safeName, title: safeTitle, avatarurl: encodeURIComponent(safeAvatar)})
                    })
                } else {
                    createData({id: parseInt(newId), name: safeName, title: safeTitle, avatarurl: safeAvatar, isactive: true})
                }

                handleClose()
                setPage(0)
                setEmployees([[]])
                setGridVisibility(false)
                setAlertContentMain("Employee was successfully added to the database.")
                setAlertTypeMain("success")
                setAlertVisibilityMain(true)
            } else {
                setAlertContent("The employee ID entered already exists.")
                setAlertVisibility(true)
            }
        }
        else{
            setAlertContent("The employee ID entered is not valid.")
            setAlertVisibility(true)
        }
    }

    const editMessage = (result, messageContent, alertTrigger) => {
        if (alertTrigger === 1) {
            setAlertContentMain(messageContent)
            setAlertTypeMain(result)
            setAlertVisibilityMain(true)
        } else {
            setAlertContentSecondary(messageContent)
            setAlertTypeSecondary(result)
            setAlertVisibilitySecondary(true)
        }
    }

    const changePage = (event, value) => {
        setPage(value - 1);
    }

    const changing = (input) => {
        setSearch(input.target.value);
    }

    const changingId = (input) => {
        setNewId(input.target.value);
    }

    const changingName = (input) => {
        setNewName(input.target.value);
    }

    const changingTitle = (input) => {
        setNewTitle(input.target.value);
    }

    const changingAvatar = (input) => {
        setNewAvatar(input.target.value);
        setAvatarDisplay(input.target.value)
    }

    const generateAvatar = () => {
        if (!(isNaN(newId)) && newId > 0) {
            setNewAvatar(`https://api.dicebear.com/6.x/notionists/svg?seed=${newId}`)
            setAvatarDisplay(`https://api.dicebear.com/6.x/notionists/svg?seed=${newId}`)
        }else{
            setAlertContent('You must enter a valid employee ID before generating Avatar!')
            setAlertVisibility(true)
        }
    }

  return (
    <div className="findDiv">
        <Stack spacing={1} style={{ position: "fixed", top: 10, left: 10, right: 10, zIndex: 999}}>
            <Fade
                in={alertVisibilityMain} //Write the needed condition here to make it appear
                timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                addEndListener={() => {
                    setTimeout(() => {
                    setAlertVisibilityMain(false)
                    }, 4000);
                }}
                style={{ width: 'fit-content' }}
                >
                <Alert severity={alertTypeMain}>{alertContentMain}</Alert>
            </Fade>
            <Fade
                in={alertVisibilitySecondary} //Write the needed condition here to make it appear
                timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                addEndListener={() => {
                    setTimeout(() => {
                    setAlertVisibilitySecondary(false)
                    }, 4000);
                }}
                style={{ width: 'fit-content' }}
                >
                <Alert severity={alertTypeSecondary}>{alertContentSecondary}</Alert>
            </Fade>
        </Stack>
        
        <div className="searchBox">
            <div className='searchCreate'>
                <div className='createButton'>
                    <Button onClick={handleClickOpen} variant='contained' color='success'>+Add new Employee</Button>
                </div>
                <div className='searchHead'>
                    <h2 className='pageSubtitle'>Search employees by name:</h2>
                </div>
            </div>
            <div className='searchFields'>
                <SearchTextField fullWidth id="employeeSearch" label="Employee Name" onChange={changing}/>
            </div>
            <div>
                <ButtonGroup className='searchButtons' variant="contained" aria-label="outlined primary button group">
                    <Button onClick={findHandle}>Search by name</Button>
                    <Button onClick={handleFetchAll}>Display all</Button>
                </ButtonGroup>
                <FormGroup className='displayInactive'>
                    <FormControlLabel className='displayInactiveToggle' control={<Switch onChange={handleInactiveToggle} />} label="Display inactive employees" />
                </FormGroup>
            </div>
            <Collapse in={gridVisibility} timeout={1000}>
                <div className="cardBox" >
                    <div className='cardGrid'>
                        {employees[page].map(employee => <EmployeeCard key={employee.id} employee={employee} messageEdit={editMessage} refresh={handleFetchAll} checkId={isIdUnique}/>)}
                    </div>
                    <Pagination className='pageSlider' size='large' count={employees.length} page={page + 1} onChange={changePage} />
                </div>
            </Collapse>
        </div>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Edit the employee:</DialogTitle>
            <div className='dialogBody'>
                <DialogContent className='cardForm'>
                    <DialogContentText>
                        <i>Fill the following form to populate employee card:</i>
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        id="employeeId"
                        label="Employee ID:"
                        type="number"
                        fullWidth
                        variant="standard"
                        onChange={changingId}
                    />
                    <TextField
                        margin="dense"
                        id="employeeName"
                        label="Employee Name:"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={changingName}
                    />
                    <TextField
                        margin="dense"
                        id="employeeTitle"
                        label="Employee Title:"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={changingTitle}
                    />
                    <TextField
                        margin="dense"
                        id="employeeAvatar"
                        label="Employee Avatar:"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newAvatar}
                        onChange={changingAvatar}
                    />
                    <Button onClick={generateAvatar}>Generate Randon Avatar</Button>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={save}>Submit</Button>
                    </DialogActions>
                </DialogContent>
                <div>
                    <div className="cardEdit">
                        <img 
                            src={avatarDisplay} 
                            alt="Avatar" 
                            width="240px" 
                        />
                        <div className="containerEdit">
                            <p>{newName}</p>
                            <p>Employee ID: {newId}</p>
                            <p>{newTitle}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Fade
                in={alertVisibility} //Write the needed condition here to make it appear
                timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                addEndListener={() => {
                    setTimeout(() => {
                    setAlertVisibility(false)
                    }, 4000);
                }}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 999 }}
                >
                <Alert severity='error'>{alertContent}</Alert>
            </Fade>
        </Dialog>
    </div>
  );
}