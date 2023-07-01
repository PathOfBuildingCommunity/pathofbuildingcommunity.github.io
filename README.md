# pathofbuildingcommunity.github.io

Website for [Path of Building](https://github.com/PathOfBuildingCommunity/PathOfBuilding)

Made with https://github.com/CloudCannon/hydra-jekyll-template

## Developing with local ruby

```
$ bundle install
$ bundle exec jekyll serve --livereload
```

## Developing with a container

```
$ docker build . -t pob
$ docker run --rm -it -v "`pwd`:/site" pob bundle add webrick
$ docker run --rm -it -p 4000:4000 -v "`pwd`:/site" pob jekyll serve -H 0.0.0.0
```

Make sure to not commit changes to `Gemfile` and `Gemfile.lock` if you go with this approach.

To get file watching working on filesystems that don't suport inotify (Windows outside WSL, macOS), add `--force_polling`.

To get livereload working, add `-p 35729:35729`.
