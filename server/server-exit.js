/**
 *  terminator === the termination handler
 *  Terminate server on receipt of the specified signal.
 *  @param {string} sig  Signal to terminate on.
 */
function terminator(sig)
{
	if (typeof sig === "string")
	{
	   console.log('%s: Received %s - terminating Grouplanner ...', Date(Date.now()), sig);
	   process.exit(1);
	}
	console.log('%s: Grouplanner stopped.', Date(Date.now()) );
}

// Process on exit and signals.
process.on('exit', function(){ terminator(); });

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element)
{
	process.on(element, function() { terminator(element); });
});
