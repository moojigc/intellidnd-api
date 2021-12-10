import Twilio from 'twilio';

import * as dotenv from "dotenv";
dotenv.config()

const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
export default twilio;