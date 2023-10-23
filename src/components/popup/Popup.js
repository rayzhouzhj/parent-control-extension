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

export const getCurrentTabUId = (callback) => {
    const queryInfo = { active: true, currentWindow: true };

    chrome.tabs &&
        chrome.tabs.query(queryInfo, (tabs) => {
            callback(tabs[0].id);
        });
};

function Popup() {
    const [block, setBlock] = React.useState(false);
    const [blockBy, setBlockBy] = React.useState('domain');

    React.useEffect(() => {
        console.log('Switch value:', block);
        console.log('Slider value:', blockBy);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const url = tabs[0].url;
            chrome.runtime.sendMessage({
                action: block ? 'block' : 'unblock',
                blockBy,
                url,
            });
        });
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
                        <AntSwitch inputProps={{ 'aria-label': 'ant design' }} onChange={handleSwitchChange}/>
                        <Typography>On</Typography>
                    </Stack>
                </Box>
            </Item>
            <Item>
                <Box sx={{ width: 260 }}>
                    <Slider
                        aria-label="Custom marks"
                        defaultValue={0}
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