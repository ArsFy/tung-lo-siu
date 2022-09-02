import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from "@mui/material/IconButton";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import CloseIcon from '@mui/icons-material/Close';

class Photo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alertStatus: "info",
            alertOpen: false,
            alertText: "",
            show: false,
            loaded: false,
            chiplist: JSON.parse(this.props.info.tags),
            wh: [0, 0],
            mh: false,
        }
    }

    downloadImg(url) {
        const img = new Image();
        img.src = url;
        img.crossOrigin = '*';
        img.onload = () => {
            let canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            let ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            let base64 = canvas.toDataURL('image/png', 1.0)
            const a = document.createElement('a');
            a.href = base64;
            a.download = new Date() / 1 + '.png';
            a.dispatchEvent(new MouseEvent('click'))
        }
    }

    render() {
        let { show, loaded, chiplist, alertOpen, alertStatus, alertText, wh, mh } = this.state;

        const handleClose = () => this.setState({ show: false });

        let des = this.props.info.text;
        let linklist = des.match(/(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g);
        if (linklist !== null) {
            for (let i = 0; i < linklist.length; i++) {
                des = des.replace(linklist[i], `<a class="link" href='${linklist[i]}' target="_blank">${linklist[i]}</a>`)
            }
        }

        return (
            <>
                <Box className='img-card' style={{ visibility: loaded ? "visible" : "collapse" }}>
                    <Badge badgeContent={(this.props.info.r18 && !this.props.shownsfw) ? 'N' : 0} color="primary" sx={{ "span": { zIndex: 1200 } }}>
                        <CardActionArea sx={{ borderRadius: '5px' }} onClick={() => this.setState({ show: true })}>
                            <Card sx={{ padding: '5px' }}>
                                <img src={this.props.src} style={{ filter: (this.props.info.r18 && !this.props.shownsfw) ? 'blur(10px)' : '' }} alt='' name="item" onLoad={() => {
                                    this.props.onLoad();
                                    this.setState({ loaded: true, chiplist: [] });
                                    (async () => {
                                        let img = new Image();
                                        img.src = this.props.src;
                                        img.onload = () => {
                                            let cl = [];
                                            cl.push(`${img.width}x${img.height}`);
                                            cl.push(...JSON.parse(this.props.info.tags));
                                            this.setState({ chiplist: cl, wh: [img.width, img.height] })
                                        }
                                    })()
                                }} />
                            </Card>
                        </CardActionArea>
                    </Badge >
                </Box >
                <Dialog
                    open={show}
                    onClose={handleClose}
                    className="dialog-img"
                    maxWidth="md"
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    id="dialog-info"
                >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: wh[0] / wh[1] > 1.1 ? 'column' : 'row' } }}>
                        <Box component={"img"} src={this.props.src} alt='' sx={{
                            width: { xs: '100%', sm: wh[0] / wh[1] > 1.1 ? '100%' : '40%' }, minHeight: mh ? {} : {
                                xs: ((document.body.clientWidth - 64) / wh[0]) * wh[1] + "px",
                                sm: ((document.body.clientWidth - 64) * 0.4 / wh[0]) * wh[1] + "px",
                                md: (360 / wh[0]) * wh[1] + "px",
                            }
                        }} onLoad={() => {
                            this.setState({ mh: true })
                        }}></Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <DialogTitle sx={{ paddingBottom: '5px' }}>
                                {this.props.info.title}
                            </DialogTitle>
                            <DialogContent>
                                <Stack direction="row" spacing={1} sx={{ paddingBottom: '5px' }}>
                                    {chiplist.map((item, index) => {
                                        return <Chip label={item} key={index} />
                                    })}
                                </Stack>
                                <DialogContentText dangerouslySetInnerHTML={{ __html: des }}></DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    this.setState({
                                        alertStatus: "success",
                                        alertOpen: true,
                                        alertText: 'Download...'
                                    });
                                    this.downloadImg(this.props.src)
                                }}>Download</Button>
                                <Button onClick={handleClose} autoFocus>Back</Button>
                            </DialogActions>
                        </Box>
                    </Box>
                </Dialog>
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

export default Photo;