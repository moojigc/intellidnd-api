import React from 'react';
import contents from '../../content/guide_contents';
import Markdown from 'react-markdown';
import Window from '../Window';

const Guide = () => {
	return (
		<Window className="guide wrapper">
			<Markdown source={contents.description} />
			{contents.commands.map(({ name, example, explanation }) => (
				<React.Fragment key={name}>
					<h2>{name}</h2>
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
