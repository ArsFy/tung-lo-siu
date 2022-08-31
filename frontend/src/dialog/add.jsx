import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import AddIcon from '@mui/icons-material/Add';

import axios from 'axios';

import { BootstrapDialog, BootstrapDialogTitle } from '../modules/BootstrapDialog';

export default class Add extends React.Component {
    constructor(props) {
        super(props);
        this.paste = null;
        this.img = null;
        this.taglist = [];
        this.state = {
            alertStatus: "info",
            alertOpen: false,
            alertText: "",
            tagvalue: '',
            taglist: [],
            img: '',
            r18: false
        }
    }

    componentDidMount() {
        const getBlob = (url) => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.src = url;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    canvas.height = img.naturalHeight;
                    canvas.width = img.naturalWidth;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(await (await fetch(canvas.toDataURL('image/webp'))).blob());
                }
            });
        }

        this.addtag = () => {
            if (this.state.tagvalue !== '') {
                this.state.taglist.push(this.state.tagvalue);
                this.setState({ tagvalue: '', taglist: this.state.taglist });
                this.taglist = this.state.taglist;
            }
        }

        this.deltag = (index) => {
            this.state.taglist.splice(index, 1);
            this.setState({ taglist: this.state.taglist });
            this.taglist = this.state.taglist;
        }

        this.handleFileSelect = (e) => {
            e.stopPropagation();
            e.preventDefault();
            document.getElementById("fileUploader").click();
        }

        this.handleFiles = (files) => {
            try {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e => {
                    this.setState({ img: e.target.result })
                    this.img = e.target.result;
                });
                reader.readAsDataURL(file);
            } catch (e) { }
        }

        this.drop = (e) => {
            e.stopPropagation();
            e.preventDefault();
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }

        this.upload = (formdata) => {
            getBlob(formdata.img).then(r => {
                let form = new FormData();
                form.append("file", r, new Date() / 1 + ".webp");
                form.append("title", formdata.title);
                form.append("description", formdata.description);
                form.append("tags", JSON.stringify(this.taglist));
                form.append("r18", String(this.state.r18));

                axios.post('/api/upload', form).then(res => {
                    this.props.reload();
                })
            })
        }

        this.close = () => {
            this.setState({ taglist: [], img: '', tagvalue: '' });
            this.props.handleClose();
        }

        const notempty = (list) => {
            for (let i in list) {
                if (list[i] === "") { return false }
            }
            return true;
        }

        this.handleSubmit = (event) => {
            console.log(this.state)
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            let formdata = {
                title: data.get("title"),
                description: data.get("description"),
                img: this.img
            };
            console.log(formdata)
            if (notempty(formdata)) {
                this.upload(formdata);
            } else {
                this.setState({
                    alertStatus: "warning",
                    alertOpen: true,
                    alertText: "Form must be filled in completely"
                })
            }
        };
    }

    componentDidUpdate() {
        if (this.props.paste && this.paste !== this.props.paste) {
            let items = this.props.paste.clipboardData && this.props.paste.clipboardData.items;

            let file = null;
            if (items && items.length) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        file = items[i].getAsFile();
                    }
                }
            }
            if (file !== null) {
                this.handleFiles([file]);
            }
            this.paste = this.props.paste;
        }
    }

    render() {
        let { alertStatus, alertOpen, alertText, tagvalue, taglist, img, r18 } = this.state;

        return (
            <>
                <BootstrapDialog
                    onClose={this.close}
                    aria-labelledby="customized-dialog-title"
                    open={this.props.open}
                >
                    <Box
                        component="form"
                        onSubmit={this.handleSubmit}
                        id='upload-form'
                        noValidate
                    >
                        <BootstrapDialogTitle id="customized-dialog-title" onClose={this.close}>
                            Add
                        </BootstrapDialogTitle>
                        <DialogContent sx={{ minWidth: { xs: '', sm: '400px' } }}>
                            <Box sx={{ margin: 1 }}>
                                <input type="file" accept="image/*" id="fileUploader" style={{ display: 'none' }} onChange={e => this.handleFiles(e.target.files)} />
                                <ButtonBase sx={{ width: '100%', borderRadius: '5px' }}
                                    onClick={e => this.handleFileSelect(e)}
                                    onDragEnter={this.dragenter}
                                    onDragOver={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    onDrop={this.drop}
                                >
                                    <Card variant="outlined" sx={{
                                        width: '100%',
                                        height: '160px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        opacity: 0.8,
                                        overflow: 'hidden'
                                    }}>
                                        {img === '' &&
                                            <>
                                                <AddIcon />
                                                <Typography>Drag or select a picture</Typography>
                                            </>
                                        }
                                        {img !== '' &&
                                            <img src={img} alt='' style={{ height: '100%' }} />
                                        }
                                    </Card>
                                </ButtonBase>
                                <TextField
                                    required
                                    label="Title"
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    name="title"
                                    id="title"
                                    fullWidth
                                />
                                <TextField
                                    required
                                    label="Description"
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    name="description"
                                    id="description"
                                    fullWidth
                                />
                                <Stack direction="row" spacing={1} sx={{ mt: taglist.length > 0 ? 2 : 0 }}>
                                    {taglist.map((item, index) => {
                                        return <Chip key={index} label={item} onClick={() => this.deltag(index)} />
                                    })}
                                </Stack>
                                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <TextField
                                        label="Tag"
                                        variant="outlined"
                                        sx={{ mt: 2, flex: 1 }}
                                        onChange={(event) => this.setState({ tagvalue: event.target.value })}
                                        value={tagvalue}
                                    />
                                    <Button variant="contained" sx={{ mt: 2, ml: 1 }} onClick={this.addtag}>Add</Button>
                                </Box>
                                <FormControlLabel control={<Switch checked={r18} onChange={() => this.setState({ r18: !r18 })} />} label="NSFW Image" sx={{ mt: 1 }} />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" onClick={this.close}>Upload</Button>
                        </DialogActions>
                    </Box>
                </BootstrapDialog >
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