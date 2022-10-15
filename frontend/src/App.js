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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Avatar from '@mui/material/Avatar';

import Photo from './modules/photo';

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
            about_show: false,
            sitename: '',
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
                data: { page: page ? Number(page) : 1 },
                withCredentials: true
            }).then(res => {
                let isone = (page ? Number(page) : 1) === 1;
                this.state.imglist.push(...res.data.data)
                this.setState({
                    load: false,
                    imglist: isone ? res.data.data : this.state.imglist,
                    count: res.data.count,
                    ...isone ? {
                        sitename: res.data.sitename
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

        window.addEventListener('scroll', this.scrollLoad);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.waterfall);
    }

    render() {
        let { imglist, load, alertOpen, alertStatus, alertText, sitename, shownsfw, about_show, count } = this.state;

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
                        </Toolbar>
                    </AppBar>
                </Box>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
                    open={load}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
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
