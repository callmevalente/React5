import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Fade from "@mui/material/Fade";
import Grow from '@mui/material/Grow';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { deleteData, updateData } from './dataStoreLocal';

export default function EmployeeCard(props) {
    const [open, setOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleteCheck, setDeleteCheck] = React.useState(false);
    const [deleteAlertVisibility, setDeleteAlertVisibility] = React.useState(false);
    const [id, setId] = React.useState(props.employee.id)
    const [newId, setNewId] = React.useState(parseInt((' ' + props.employee.id).slice(1)))
    const [ogId] = React.useState(props.employee.id)
    const [name, setName] = React.useState(props.employee.name)
    const [newName, setNewName] = React.useState((' ' + props.employee.name).slice(1))
    const [title, setTitle] = React.useState(props.employee.title)
    const [newTitle, setNewTitle] = React.useState((' ' + props.employee.title).slice(1))
    const [avatar, setAvatar] = React.useState(props.employee.avatarurl)
    const [newAvatar, setNewAvatar] = React.useState((' ' + props.employee.avatarurl).slice(1))
    const [setAvatarDisplay] = React.useState(props.employee.avatarurl)
    const [newAvatarDisplay] = React.useState((' ' + props.employee.avatarurl).slice(1))
    const [employeeState, setEmployeeState] = React.useState(props.employee.isactive)
    const [newEmployeeState] = React.useState(() => {
        if (props.employee.isactive) {
            return true
        } else {
            return false
        }
    })
    const [alertVisibility, setAlertVisibility] = React.useState(false);
    const [alertContent, setAlertContent] = React.useState('');
    const [editCardStatus, setEditCardStatus] = React.useState("");
    const [cardType, setCardType] = React.useState(() => {
        if (props.employee.isactive) {
            return "card"
        } else {
            return "disabledCard"
        }
    })
    const [deleteDisplay, setDeleteDisplay] = React.useState(() => {
        if (props.employee.isactive) {
            return "visibleButton"
        } else {
            return "hiddenButton"
        }
    })

    const deleteUser = () => {
        if (deleteCheck) {
            if (navigator.onLine) {
                fetch(`/delete/${id}`, {
                    method: "DELETE"
                })
                    .then(() => {
                        props.refresh()
                        setEditCardStatus("disabledCardEdit")
                        setCardType("disabledCard")
                        setDeleteDisplay("hiddenButton")
                        setEmployeeState(false)
                        props.messageEdit("success", "The employee entry was successfully deactivated!", 2)
                    })
            } else {
                deleteData(id)
                    .then(() => {
                            props.refresh()
                            setEditCardStatus("disabledCardEdit")
                            setCardType("disabledCard")
                            setDeleteDisplay("hiddenButton")
                            setEmployeeState(false)
                            props.messageEdit("success", "The employee entry was successfully deactivated!", 2)
                        })
            }
        } else {
            setDeleteAlertVisibility(true)
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
            if (props.checkId(parseInt(newId)) || newId === ogId) {
                setId(newId)
                setName(newName)
                setTitle(newTitle)
                setAvatar(newAvatar)
                let safeName = newName.replace("'","''");
                let safeTitle = newTitle.replace("'","''");
                let safeAvatar = newAvatar.replace("'","''");
                if (navigator.onLine) {
                    fetch(`/update/${ogId}/${newId}/${safeName}/${safeTitle}/${encodeURIComponent(safeAvatar)}/${newEmployeeState}`, {
                        method: "PUT"
                    })
                        .then(() => {
                            handleClose()
                            props.refresh()
                            props.messageEdit("success", "The employee entry was successfully updated!", 1)
                        })
                } else {
                    console.log(safeName)
                    updateData({ogId: ogId, id: id, name: safeName, title: safeTitle, avatarurl: safeAvatar, isactive: employeeState})
                        .then(() => {
                            handleClose()
                            props.refresh()
                            props.messageEdit("success", "The employee entry was successfully updated!", 1)
                        })
                }
            } else {
                setAlertContent("The employee ID entered is already in use.")
                setAlertVisibility(true)
            }
        }else{
            setAlertContent("The employee ID entered is not valid.")
            setAlertVisibility(true)
        }
    }

    const generateAvatar = () => {
        if (!(isNaN(id)) && id > 0) {
            setAvatar(`https://api.dicebear.com/6.x/notionists/svg?seed=${id}`)
            setAvatarDisplay(`https://api.dicebear.com/6.x/notionists/svg?seed=${id}`)
        }else{
            setAlertContent('You must enter a valid employee ID before generating Avatar!')
            setAlertVisibility(true)
        }
    }

    const handleClickOpen = () => {
        if (props.employee.isactive) {
            setEditCardStatus("cardEdit")
        } else {
            setEditCardStatus("disabledCardEdit")
        }
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
    };

    const handleDeleteOpen = () => {
        setDeleteOpen(true);
    }

    const handleCloseDelete = () => {
        setDeleteCheck(false);
        setDeleteOpen(false);
        props.refresh();
    };

    const handleStatusToggle = (event) => {
        if (event.target.checked) {
            setEditCardStatus("disabledCardEdit")
            setCardType("disabledCard")
            setDeleteDisplay("hiddenButton")
            setEmployeeState(false)
        } else {
            setEditCardStatus("cardEdit")
            setCardType("card")
            setDeleteDisplay("visibleButton")
            setEmployeeState(true)
        }
    }

    const handleDeleteCheck = () => {
       setDeleteCheck(!deleteCheck)
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

    return (
        <div className={cardType}>
            <img 
                src={avatar} 
                alt="Avatar" 
                width="240px" 
            />
            <div className="container">
                <p>{name}</p>
                <p>Employee ID: {id}</p>
                <p>{title}</p>
                <div className='cardButtons'>
                    <EditSharpIcon style={{cursor: 'pointer'}} fontSize='large' sx={{ color: '#010A26' }} onClick={handleClickOpen}/>
                    <DeleteIcon className={deleteDisplay} style={{cursor: 'pointer'}} fontSize='large' sx={{ color: '#bd2014' }} onClick={handleDeleteOpen} />
                </div>
                <Dialog open={open} onClose={handleClose} TransitionComponent={Grow} transitionDuration={1000}>
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
                                defaultValue={newId}
                                onChange={changingId}
                            />
                            <TextField
                                margin="dense"
                                id="employeeName"
                                label="Employee Name:"
                                type="text"
                                fullWidth
                                variant="standard"
                                defaultValue={newName}
                                onChange={changingName}
                            />
                            <TextField
                                margin="dense"
                                id="employeeTitle"
                                label="Employee Title:"
                                type="text"
                                fullWidth
                                variant="standard"
                                defaultValue={newTitle}
                                onChange={changingTitle}
                            />
                            <TextField
                                margin="dense"
                                id="employeeAvatar"
                                label="Employee Avatar:"
                                type="text"
                                fullWidth
                                variant="standard"
                                defaultValue={newAvatar}
                                onChange={changingAvatar}
                            />
                            <Button onClick={generateAvatar}>Generate Randon Avatar</Button>
                            <div>
                                <label>Deactivate Employee?</label>
                                <Switch onChange={handleStatusToggle} checked={!employeeState}/>
                            </div>
                            
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button onClick={save}>Submit</Button>
                            </DialogActions>
                        </DialogContent>
                        <div>
                            <div className={editCardStatus}>
                                <img 
                                    src={newAvatarDisplay}
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
            <Dialog
                open={deleteOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"Delete employee from the database?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure that you wish to deactivate {name} from our employee database?
                </DialogContentText>
                <FormGroup>
                    <FormControlLabel 
                        control={<Checkbox />} 
                        label="Check this box to confirm that you wish to deactivate this employee."
                        checked={deleteCheck}
                        onChange={handleDeleteCheck} />
                </FormGroup>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDelete}>Cancel</Button>
                <Button onClick={deleteUser} autoFocus>
                    DEACTIVATE
                </Button>
                </DialogActions>
                <Fade
                        in={deleteAlertVisibility} //Write the needed condition here to make it appear
                        timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                        addEndListener={() => {
                            setTimeout(() => {
                            setDeleteAlertVisibility(false)
                            }, 4000);
                        }}
                        style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 999 }}
                        >
                        <Alert severity='error'>You must check the box to confirm the deactivation.</Alert>
                    </Fade>
            </Dialog>
        </div>
    );
}