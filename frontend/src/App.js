import React from 'react';

import Link from '@mui/material/Link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from "@mui/material/IconButton";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import Photo from './modules/photo';
import Login from './dialog/login';
import Add from './dialog/add';
import Setting from './dialog/setting';

import axios from 'axios';

import './style.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.loaded = 0;
        this.lock = false;
        this.page = 1;
        this.loadpic = 0;
        this.onLoad = () => {
            this.waterfall();
            this.loaded++;
            if (this.loaded >= this.state.imglist.length) this.setState({ load: false });
        }
        this.scroll = null;
        this.state = {
            alertStatus: "info",
            alertOpen: false,
            alertText: "",
            imglist: [],
            load: true,
            count: 0,
            login_show: false,
            add_show: false,
            setting_show: false,
            about_show: false,
            login: false,
            md5: '',
            username: '',
            sitename: '',
            paste: false,
            tags: [],
            taglist: [],
            shownsfw: localStorage.getItem("shownsfw") === 'true',
        }
    }

    waterfall() {
        let w = document.getElementsByClassName("img-card");
        if (w.length > 0) {
            let column = parseInt((document.getElementsByClassName("container")[0].offsetWidth + 10) / w[0].offsetWidth);

            let heightArr = [];
            for (let i = 0; i < column; i++) {
                heightArr[i] = 0;
            }

            let ic = document.getElementsByClassName("img-card");
            for (let i = 0; i < ic.length; i++) {
                let itemHeight = ic[i].offsetHeight;
                let minHeight = Math.min(...heightArr);
                let minIndex = heightArr.indexOf(minHeight);

                ic[i].style.top = minHeight + 'px';
                ic[i].style.left = minIndex * w[0].offsetWidth + 'px';

                heightArr[minIndex] += itemHeight;
            }

            let cp = document.getElementById("cp");
            cp.style.top = Math.max(...heightArr) + 'px';

            this.loadpic++;
            if (this.loadpic === this.state.imglist.length) this.scrollLoad();
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.waterfall);

        this.logout = () => {
            this.setState({
                alertStatus: "success",
                alertOpen: true,
                alertText: 'Logging out...'
            });
            axios({
                method: 'POST',
                url: '/api/logout',
                withCredentials: true
            }).then(res => {
                window.location.reload()
            })
        }

        this.pasteImage = (e) => {
            if (this.state.login) {
                this.setState({
                    add_show: true,
                    paste: e
                })
            }
        }

        this.scrollLoad = () => {
            clearTimeout(this.scroll);
            this.scroll = setTimeout(() => {
                let ele = document.getElementById("cp");

                if (
                    (ele.offsetTop + ele.offsetHeight <= document.documentElement.scrollTop + document.documentElement.clientHeight)
                    &&
                    (ele.offsetTop >= document.documentElement.scrollTop)
                ) {
                    if (this.state.count !== this.state.imglist.length && !this.lock) {
                        this.lock = true;
                        this.page++;
                        this.start(this.page);
                    }
                }
            }, 100);
        }

        this.start = (page, taglist) => {
            this.setState({ load: true });
            axios({
                method: 'POST',
                url: '/api/list',
                data: { page: page ? Number(page) : 1, ...(taglist ? { tags: JSON.stringify(taglist) } : { tags: JSON.stringify(this.state.taglist) }) },
                withCredentials: true
            }).then(res => {
                let isone = (page ? Number(page) : 1) === 1;
                this.state.imglist.push(...res.data.data)
                this.setState({
                    load: false,
                    imglist: isone ? res.data.data : this.state.imglist,
                    count: res.data.count,
                    ...isone ? {
                        sitename: res.data.sitename,
                        login: res.data.login,
                        md5: res.data.md5,
                        username: res.data.username,
                        tags: res.data.tags
                    } : {}
                })
                if (isone) document.title = res.data.sitename;
                this.lock = false;
            }).catch(err => {
                this.setState({
                    load: false,
                    alertStatus: "error",
                    alertOpen: true,
                    alertText: 'Network/Server Error'
                });
                console.error(err.message)
            })
        }

        this.start();

        window.addEventListener('paste', this.pasteImage);
        window.addEventListener('scroll', this.scrollLoad);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.waterfall);
        window.removeEventListener('paste', this.pasteImage);
        window.removeEventListener('scroll', this.scrollLoad);
    }

    render() {
        let { imglist, load, alertOpen, alertStatus, alertText, login_show, login, md5, username, sitename, add_show, setting_show, paste, shownsfw, about_show, count, tags, taglist } = this.state;

        return (
            <Box className='box'>
                <Box sx={{ flexGrow: 1, position: 'fixed', top: 0, left: 0, width: '100%', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <AppBar position="static" color="transparent" sx={{ backgroundColor: '#FFF' }} elevation={0}>
                        <Toolbar>
                            <Box sx={{ my: 1, mr: 1, userSelect: 'none', cursor: 'pointer' }} onClick={() => this.setState({ about_show: true })}>
                                <Avatar src="./logo192.png" style={{ width: 42, height: 42 }} alt="logo" />
                            </Box>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', userSelect: 'none', cursor: 'pointer' }} onClick={() => this.setState({ about_show: true })}>{sitename} <MenuIcon sx={{
                                bottom: '1.55em',
                                position: 'absolute',
                                fontSize: 16,
                                ml: 0.5,
                                opacity: 0.6
                            }} /></Typography>
                            {!login && <Button color="inherit" onClick={() => this.setState({ login_show: true })}>Login</Button>}
                            {login &&
                                <>
                                    <Tooltip title="Add">
                                        <IconButton onClick={() => this.setState({ add_show: true })} size="large">
                                            <AddIcon />
                                        </IconButton></Tooltip>
                                    <Tooltip title="Setting">
                                        <IconButton onClick={() => this.setState({ setting_show: true })} size="large">
                                            <SettingsIcon />
                                        </IconButton></Tooltip>
                                    <Tooltip title={username}>
                                        <IconButton onClick={this.logout} size="large" sx={{ my: 1, ml: 1, backgroundColor: '#d7d7d7', backgroundImage: `url(https://www.gravatar.com/avatar/${md5}?d=mm)`, backgroundSize: 'cover' }} className="logout">
                                            <LogoutIcon />
                                            <Box className="ol"></Box>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            }
                        </Toolbar>
                    </AppBar>
                </Box>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
                    open={load}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Stack direction="row" spacing={1} sx={{ mt: '70px', width: '95%', marginLeft: '2.5%' }}>
                    {tags.map((item, index) => {
                        return <Chip label={item} key={index} variant={taglist.indexOf(item) !== -1 ? "" : "outlined"} onClick={() => {
                            if (taglist.indexOf(item) === -1) {
                                taglist.push(item); this.setState({ taglist: taglist });
                            } else {
                                taglist.splice(taglist.indexOf(item), 1); this.setState({ taglist: taglist });
                            }
                            this.start(1, taglist); this.page = 1;
                        }} />
                    })}
                </Stack>
                <Box className="container">
                    {imglist.map((item, index) => {
                        return <Photo src={`/image/${item.file}`} key={index} onLoad={this.onLoad} info={item} shownsfw={shownsfw} />
                    })}
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', position: 'absolute', py: 4 }} id="cp">
                        {count === imglist.length && <Typography sx={{ opacity: 0.6 }}>No more</Typography>}
                        {count !== imglist.length && <CircularProgress />}
                    </Box>
                    <Typography sx={{
                        backgroundColor: '#ffffff8a',
                        left: 0,
                        position: 'fixed',
                        textAlign: 'center',
                        bottom: 0,
                        width: '100%',
                        zIndex: 1299
                    }}>Powered By <Link href="https://github.com/ArsFy/tung-lo-siu" target="_blank">TungLoSiu</Link></Typography>
                </Box>
                {/* Login */}
                <Login open={login_show} handleClose={() => this.setState({ login_show: false })} />
                {/* Add */}
                <Add open={add_show} handleClose={() => this.setState({ add_show: false, paste: false })} paste={paste} reload={() => {
                    this.setState({ imglist: [] });
                    this.start();
                }} />
                {/* Setting */}
                <Setting open={setting_show} handleClose={() => this.setState({ setting_show: false })} upsetting={() => {
                    this.setState({ shownsfw: localStorage.getItem("shownsfw") === 'true' })
                }} />
                {/* About */}
                <Dialog
                    open={about_show}
                    onClose={() => this.setState({ about_show: false })}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar src="./logo512.png" style={{ width: 125, height: 128 }} alt="logo" />
                        </Box>
                        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {sitename}
                        </DialogTitle>
                        <DialogContentText>
                            Open source image upload and display site.<br />
                            Github: <Link href='https://github.com/ArsFy/tung-lo-siu' target={"_blank"}>https://github.com/ArsFy/tung-lo-siu</Link>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ about_show: false })}>Back</Button>
                    </DialogActions>
                </Dialog>
                {/* Snackbar */}
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
            </Box>
        )
    }
}

export default App;
