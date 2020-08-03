import React from 'react';
import { Container, Typography } from '@material-ui/core';
import Hero from '../../components/Hero';
import { Wrapper } from '../../components/MiniComponents';
import Card from '../../components/Card';

const Inventory = () => {
    return (
        <Container>
            <Hero>
                <Typography variant='h1' component='h1'>
                    inventory
                </Typography>
            </Hero>
            <Wrapper>
                {['Weapons', 'Potions', 'Misc'].map(c => (
                    <Card title={c} />
                ))}
            </Wrapper>
        </Container>
    );
};

export default Inventory;
