import React from 'react';
import contents from '../../content/guide_contents';
import Markdown from 'react-markdown';
import Window from '../Window';
import { Typography } from '@material-ui/core';

const Guide = () => {
	return (
		<Window className="guide wrapper">
			<Markdown source={contents.description} />
			{contents.commands.map(({ name, example, explanation }) => (
				<React.Fragment key={name}>
					<h3>{name}</h3>
					{example && <Markdown source={example} />}
					{explanation.map((e) => (
						<Markdown source={e} />
					))}
				</React.Fragment>
			))}
		</Window>
	);
};

export default Guide;
