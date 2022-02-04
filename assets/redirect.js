function redirect() {
	const params = new URL(location.href).searchParams;
	// There should only be one site to redirect, so just grab the first one and load it
	const [site, hash] = params.entries().next();
	window.location.href = `pob:${site}/${hash}`;
}
redirect();