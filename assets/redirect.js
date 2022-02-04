function redirect() {
	const params = new URL(location.href).searchParams;
	// There should only be one site to redirect, so just grab the first one and load it
	for (const [site, hash] of params.entries()) {
		window.location.href = `pob:${site}/${hash}`;
		break;
	}
}
redirect();