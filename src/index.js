import { Command } from 'commander';
import registerCommand from './commands/register.js';
import transferCommand from './commands/transfer.js';

const program = new Command();

program
  .name('rsk')
  .description('Rootstock RNS CLI')
  .version('1.0.0');

program.addCommand(registerCommand);
program.addCommand(transferCommand);

program.parse();
