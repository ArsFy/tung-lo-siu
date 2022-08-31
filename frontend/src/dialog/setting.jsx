import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { BootstrapDialog, BootstrapDialogTitle } from '../modules/BootstrapDialog';

export default class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alertStatus: "info",
            alertOpen: false,
            alertText: "",
            display_nsfw: localStorage.getItem("shownsfw") === 'true',
        }
    }

    render() {
        let { alertStatus, alertOpen, alertText, display_nsfw } = this.state;

        return (
            <>
                <BootstrapDialog
                    onClose={this.props.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={this.props.open}
                >
                    <BootstrapDialogTitle id="customized-dialog-title" onClose={this.props.handleClose}>
                        Setting
                    </BootstrapDialogTitle>
                    <DialogContent sx={{ minWidth: { xs: '', sm: '400px' } }}>
                        <Box sx={{ margin: 1 }}>
                            <FormGroup>
                                <FormControlLabel control={<Switch checked={display_nsfw} onChange={() => {
                                    this.setState({ display_nsfw: !display_nsfw });
                                    localStorage.setItem("shownsfw", String(!display_nsfw))
                                    this.props.upsetting();
                                }} />} label="Displays NSFW by default" />
                            </FormGroup>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" onClick={this.props.handleClose}>Back</Button>
                    </DialogActions>
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