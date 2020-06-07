import { exec } from 'child_process';
import { CronJob } from 'cron';
import { appendFileSync } from 'fs';

require('dotenv').config();

const backup = new CronJob('0 0 * * *', () => {
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE;
  const filename = (new Date()).toISOString().substring(0, 16).replace(':', '');
  const folder = process.env.BACKUP_FOLDER || 'backup';
  const command = `cd ${folder} && mysqldump -u ${user} -p${password} ${database} > ${filename}.sql`;
  const dateLog = `--------${new Date().toISOString()}--------`;
  exec(command, (error) => {
    if (error) {
      return appendFileSync('./debug.log',
        `${dateLog}\nError: ${error}`);
    }
    return appendFileSync('./debug.log',
      `${dateLog}\nDatabase backup: \nFilename: ${filename}\nInside the folder: ${folder}\n\n`);
  });
});

backup.start();
