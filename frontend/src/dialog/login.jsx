import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import axios from 'axios';

import { BootstrapDialog, BootstrapDialogTitle } from '../modules/BootstrapDialog';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alertStatus: "info",
            alertOpen: false,
            alertText: "",
        }
    }

    componentDidMount() {
        this.login = (formdata) => {
            this.setState({
                alertStatus: "info",
                alertOpen: true,
                alertText: 'Logging in...'
            });
            axios({
                method: 'POST',
                url: '/api/login',
                data: formdata
            }).then(res => {
                switch (res.data.status) {
                    case "ok":
                        window.location.reload();
                        break;
                    case "user_pass":
                        this.setState({
                            alertStatus: "warning",
                            alertOpen: true,
                            alertText: 'User/Pass Error'
                        });
                        break;
                    case "empty":
                        this.setState({
                            alertStatus: "warning",
                            alertOpen: true,
                            alertText: 'Form must be filled in completely'
                        });
                        break;
                    default:
                        this.setState({
                            alertStatus: "warning",
                            alertOpen: true,
                            alertText: 'undefined return: ' + JSON.stringify(res.data)
                        });
                }
            }).catch(err => {
                this.setState({
                    alertStatus: "error",
                    alertOpen: true,
                    alertText: 'Network/Server Error'
                });
                console.error(err.message);
            })
        }
    }

    render() {
        let { alertStatus, alertOpen, alertText } = this.state;

        const notempty = (list) => {
            for (let i in list) {
                if (list[i] === "") { return false }
            }
            return true;
        }

        const handleSubmit = (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            let formdata = {
                username: data.get("username"),
                password: data.get("password"),
            };
            if (notempty(formdata)) {
                this.login(formdata);
            } else {
                this.setState({
                    alertStatus: "warning",
                    alertOpen: true,
                    alertText: "Form must be filled in completely"
                })
            }
        };

        return (
            <>
                <BootstrapDialog
                    onClose={this.props.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={this.props.open}
                >
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <BootstrapDialogTitle id="customized-dialog-title" onClose={this.props.handleClose}>
                            Login
                        </BootstrapDialogTitle>
                        <DialogContent sx={{ minWidth: { xs: '', sm: '400px' } }}>
                            <Box sx={{ margin: 1 }}>
                                <TextField
                                    required
                                    label="Username/Email"
                                    variant="outlined"
                                    name="username"
                                    id="username"
                                    fullWidth
                                />
                                <TextField
                                    required
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    name="password"
                                    id="password"
                                    fullWidth
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" onClick={this.props.handleClose}>Login</Button>
                        </DialogActions>
                    </Box>
                </BootstrapDialog>
                <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => this.setState({ alertOpen: false })}>
                    <Alert elevation={6} variant="filled" severity={alertStatus} action={(<React.Fragment>
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={() => this.setState({ alertOpen: false })}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>)}>
                        {alertText}
                    </Alert>
                </Snackbar>
            </>
        )
    }
}