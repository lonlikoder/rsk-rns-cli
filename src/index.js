import { Command } from 'commander';
import registerCommand from './commands/register.js';
import transferCommand from './commands/transfer.js';
import renewCommand from './commands/renew.js';
import setAddrCommand from './commands/set-addr.js';
import availableCommand from './commands/available.js';
import priceCommand from './commands/price.js';
import ownerCommand from './commands/owner.js';
import resolverCommand from './commands/resolver.js';
import resolveCommand from './commands/resolve.js';

const program = new Command();

program
  .name('rsk')
  .description('Rootstock RNS CLI')
  .version('1.0.0');

program.addCommand(registerCommand);
program.addCommand(transferCommand);
program.addCommand(renewCommand);
program.addCommand(setAddrCommand);
program.addCommand(availableCommand);
program.addCommand(priceCommand);
program.addCommand(ownerCommand);
program.addCommand(resolverCommand);
program.addCommand(resolveCommand);

program.parse();
