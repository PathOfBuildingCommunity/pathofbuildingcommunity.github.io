FROM ruby

COPY Gemfile /site/Gemfile
WORKDIR /site
RUN bundle install
RUN gem install webrick
