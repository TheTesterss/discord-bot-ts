// ? Imports and initializes the dotenv package.
import { config } from 'dotenv';
config();

import Self from './classes/Self';
new Self().startClient(process.env.TOKEN!);
