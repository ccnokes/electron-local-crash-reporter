// check if a process is running
module.exports = function isRunning (pid) {
  try {
    // "process.kill will throw an error if the target pid does not exist. As a special case, a signal of 0 can be used to test for the existence of a process."
    return process.kill(pid, 0);
  }
  catch (e) {
    // kill(1, 0) returns an EPERM, and that always is running
    // if it doesn't exist, it returns a ESRCH
    return e.code === 'EPERM';
  }
}
