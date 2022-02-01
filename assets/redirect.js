function redirect() {
	const params = new URL(location.href).searchParams;
	// There should only be one site to redirect, so just grab the first one and load it
	for(var pair of params.entries()) {
		window.location.href = "pob:" + pair[0] + "/" + pair[1];
		break;
	}
}
redirect();