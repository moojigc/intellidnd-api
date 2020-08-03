import React from 'react';
import { Container, Typography } from '@material-ui/core';
import contents from './guide_contents';
import Markdown from 'react-markdown';
import { Wrapper } from '../../components/MiniComponents';
import Hero from '../../components/Hero';

const Guide = () => {
    return (
        <React.Fragment>
            <Hero>
                <Typography variant='h1' component='h1'>
                    Welcome to IntelliDnD
                </Typography>
                <p>manage your D&D character with ease</p>
                <p>integrated with a Discord bot</p>
            </Hero>
            <Container className='guide' maxWidth='lg'>
                <Wrapper>
                    <Markdown source={contents.description} />
                    {contents.commands.map(({ name, example, explanation }) => (
                        <React.Fragment>
                            <h2>{name}</h2>
                            {example && <Markdown source={example} />}
                            {explanation.map((e) => (
                                <Markdown source={e} />
                            ))}
                        </React.Fragment>
                    ))}
                </Wrapper>
            </Container>
        </React.Fragment>
    );
};

export default Guide;
