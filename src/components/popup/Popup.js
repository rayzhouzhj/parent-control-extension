/* global chrome */
import React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
    },
}));

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const marks = [
    {
        value: 0,
        label: 'Domain',
    },
    {
        value: 100,
        label: 'Full URL',
    }
];

function Popup() {
    const [block, setBlock] = React.useState(false);
    const [blockBy, setBlockBy] = React.useState('domain');

    const prevBlockRef = React.useRef(block);
    const prevBlockByRef = React.useRef(blockBy);

    React.useEffect(() => {
        console.log('Popup mounted');
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const url = tabs[0].url;
            const hostname = new URL(url).hostname;
            // Send a message to the background script
            const messageSentFlag = '__message_sent_flag__'; // Unique flag to track whether the message has been sent
            const messageSent = sessionStorage.getItem(messageSentFlag);
            if (!messageSent) {
                chrome.runtime.sendMessage({
                    action: 'GetBlockStatus',
                    domain: hostname,
                    url: url,
                    responseType: 'PopupGetBlockStatusResp'
                });
                sessionStorage.setItem(messageSentFlag, 'true'); // Set the flag to indicate that the message has been sent
            }
        });

        // Listener for the response from the background script
        const messageListener = (message, sender, sendResponse) => {
            if (message.action === 'PopupGetBlockStatusResp') {
                console.log('Received message:', message);
                // Update the state with the received data when the block status is true
                if (message.blockStatus) {
                    setBlock(true);
                    setBlockBy(message.blockBy);
                }
            }
        };

        // Register the listener
        chrome.runtime.onMessage.addListener(messageListener);

        // Cleanup: Remove the listener when the component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    React.useEffect(() => {
        if (block !== prevBlockRef.current || (block && blockBy !== prevBlockByRef.current)) {
            console.log('Popup state changed');
            console.log('Switch value:', block);
            console.log('Slider value:', blockBy);

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const url = tabs[0].url;
                const hostname = new URL(url).hostname;
                // Send a message to the background script
                chrome.runtime.sendMessage({
                    type: 'BlockControl',
                    data: {
                        action: block ? 'block' : 'unblock',
                        blockBy: blockBy,
                        domain: hostname,
                        url: url
                    }
                });
            });
        }

        // Update the previous state values
        prevBlockRef.current = block;
        prevBlockByRef.current = blockBy;
    }, [block, blockBy]);

    const handleSwitchChange = (event) => {
        const updatedSwitchValue = event.target.checked;
        setBlock(updatedSwitchValue);
    };

    const handleSliderChange = (event, newValue) => {
        let data = newValue === 0 ? 'domain' : 'url';
        setBlockBy(data);
    };

    return (
        <Stack direction="column" spacing={1} alignItems="center" style={{width: '300px'}}>
            <Item>
                <Box sx={{ width: 260 }}>
                    <Typography>Description for the option</Typography>
                </Box>
            </Item>
            <Item>
                <Box sx={{ width: 260 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Off</Typography>
                        <AntSwitch inputProps={{ 'aria-label': 'ant design' }} checked={block} onChange={handleSwitchChange}/>
                        <Typography>On</Typography>
                    </Stack>
                </Box>
            </Item>
            <Item>
                <Box sx={{ width: 260 }}>
                    <Slider
                        aria-label="Custom marks"
                        value={blockBy === 'domain' ? 0 : 100}
                        step={null}
                        valueLabelDisplay="off"
                        marks={marks}
                        onChange={handleSliderChange}
                    />
                </Box>
            </Item>                
        </Stack>
    );
}

export default Popup;