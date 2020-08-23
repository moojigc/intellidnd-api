import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ position }) => {
	return (
		<footer style={{ position }}>
			<div>
				<a
					href="https://moojigbc.com"
					rel="noopener noreferrer"
					target="_blank"
				>
					Moojig Battsogt
				</a>
			</div>
			<div>
				<Link to="/guide">See Guide</Link>
				{' | '}
				<a
					href="https://github.com/moojigc/intellidnd"
					rel="noopener noreferrer"
					target="_blank"
				>
					GitHub
				</a>
			</div>
		</footer>
	);
};

export default Footer;
