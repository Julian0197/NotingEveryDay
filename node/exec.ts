import { exec } from 'child_process'

const execCwd = exec('ls', (err, stdout, stderr) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('stdout', stdout)
})
