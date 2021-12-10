import Twilio from 'twilio';

import * as dotenv from "dotenv";
dotenv.config()

const twilio = Twilio(data.env.TWILIO_SID, data.env.TWILIO_TOKEN);
export default twilio;