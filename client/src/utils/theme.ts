import { createMuiTheme } from '@material-ui/core';

export const theme = (type: 'dark' | 'light') => {
    switch (type) {
        case 'dark':
            return createMuiTheme({
                palette: {
                    primary: {
                        main: '#9b59b6'
                    },
                    secondary: {
                        main: '#192a51'
                    },
                    background: {
                        default: '#d9b9f5'
                    }
                }
            });
        default:
        case 'light':
            return createMuiTheme({
                palette: {
                    primary: {
                        main: '#9b59b6'
                    },
                    secondary: {
                        main: '#192a51'
                    },
                    background: {
                        default: '#d9b9f5'
                    }
                }
            });
    }
};
