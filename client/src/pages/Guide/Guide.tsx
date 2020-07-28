import React from 'react'
import { Container, Box, Typography } from '@material-ui/core';
import contents from '../../utils/guide'
import Markdown from 'react-markdown'
import {Wrapper} from '../../components/MiniComponents'

const Guide = () => {
    return (
        <Container maxWidth="lg">
            <Wrapper boxShadow={2}>
                <Typography paragraph>
                    <Markdown source={contents.description}/>
                </Typography>
                {contents.commands.map(({ name, example, explanation }) => (
                    <React.Fragment>
                        <Typography>
                            <Markdown source={name}/>
                        </Typography>
                        <Typography>
                            <Markdown source={example} />
                        </Typography>
                        <Typography>
                            <Markdown source={explanation} />
                        </Typography>
                    </React.Fragment>
                ))}
            </Wrapper>
        </Container>
    )
}

export default Guide;