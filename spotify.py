import requests
from exceptions import check_limit, check_status


class Spotify():

  API_URL = 'https://api.spotify.com/v1/me'

  def __init__(self, token):
    self.token = token

    self.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer {}".format(self.token)
    }

  def user_data(self):

    response = requests.get(self.API_URL, headers=self.headers)

    check_status(response)

    return self.filter_user_data(response.json())

  def recently(self, limit=50):

    check_limit(limit)

    response = requests.get(
        self.API_URL + '/player/recently-played',
        headers=self.headers,
        params={'limit': limit}
    )

    check_status(response)

    return response.json()

  def top_tracks(self, limit=50, time_range='medium_term', offset=0):

    check_limit(limit)

    response = requests.get(
        self.API_URL + '/top/tracks',
        headers=self.headers,
        params=(
            ('time_range', time_range),
            ('limit', limit),
            ('offset', offset),
        ))

    check_status(response)

    return self.filter_top_tracks(response.json())

  def top_artists(self, limit=50, time_range='medium_term', offset=0):

    check_limit(limit)

    response = requests.get(
        self.API_URL + '/top/artists',
        headers=self.headers,
        params=(
            ('time_range', time_range),
            ('limit', limit),
            ('offset', offset),
        ))

    check_status(response)

    return self.filter_top_artists(response.json())

  def artists_popularity(self, limit=50, time_range='medium_term', offset=0):

    check_limit(limit)

    response = requests.get(
        self.API_URL + '/top/artists',
        headers=self.headers,
        params=(
            ('time_range', time_range),
            ('limit', limit),
            ('offset', offset),
        ))

    check_status(response)

    return self.filter_artists_popularity(response.json())

  def tracks_popularity(self, limit=50, time_range='medium_term', offset=0):

    check_limit(limit)

    response = requests.get(
        self.API_URL + '/top/tracks',
        headers=self.headers,
        params=(
            ('time_range', time_range),
            ('limit', limit),
            ('offset', offset),
        ))

    check_status(response)

    return self.filter_tracks_popularity(response.json())

  def filter_top_tracks(self, top_tracks):

    all_track_data = []

    for i, track_data in enumerate(top_tracks['items']):
      track_rank = str(i + 1) + ". "

      if len(track_data['album']['images']) > 0:
        track_background = track_data['album']['images'][0]['url']
      else:
        track_background = ''

      track_name = track_data['name']

      track_artists = []
      for artist in track_data['artists']:
        track_artists.append(artist['name'])

      track_popularity = track_data['popularity']

      all_track_data.append({'track_rank': track_rank,
                             'track_background': track_background,
                             'track_name': track_name,
                             'track_artists': ', '.join(track_artists),
                             'track_popularity': track_popularity})

    return all_track_data

  def filter_top_artists(self, top_artists):

    all_artist_data = []

    for i, artist_data in enumerate(top_artists['items']):
      artist_rank = str(i + 1) + ". "

      if len(artist_data['images']) > 0:
        artist_background = artist_data['images'][0]['url']
      else:
        artist_background = ''

      artist_name = artist_data['name']

      artist_followers = '{:,}'.format(artist_data['followers']['total']) + ' followers'

      artist_popularity = artist_data['popularity']

      all_artist_data.append({'artist_rank': artist_rank,
                              'artist_background': artist_background,
                              'artist_name': artist_name,
                              'artist_followers': artist_followers,
                              'artist_popularity': artist_popularity})

    return all_artist_data

  def filter_artists_popularity(self, top_artists):

    average_popularity = 0
    number_artists = top_artists['total']
    least_mainstream_artist_score = 100

    if number_artists == 0:
      tracks_popularity_data = {'number_artists': 0,
                                'average_popularity': 0,
                                'least_mainstream_artist_name': '',
                                'least_mainstream_artist_score': 0}

      return tracks_popularity_data

    for i, artist_data in enumerate(top_artists['items']):
      average_popularity += artist_data['popularity']

      if artist_data['popularity'] < least_mainstream_artist_score and artist_data['popularity'] > 0:
        least_mainstream_artist_name = artist_data['name']
        least_mainstream_artist_score = artist_data['popularity']

    artists_popularity_data = {'number_artists': number_artists,
                               'average_popularity': round(average_popularity / number_artists),
                               'least_mainstream_artist_name': least_mainstream_artist_name,
                               'least_mainstream_artist_score': least_mainstream_artist_score}

    return artists_popularity_data

  def filter_tracks_popularity(self, top_tracks):

    average_popularity = 0
    number_tracks = top_tracks['total']
    least_mainstream_track_score = 100

    if number_tracks == 0:
      tracks_popularity_data = {'number_tracks': 0,
                                'average_popularity': 0,
                                'least_mainstream_track_name': '',
                                'least_mainstream_track_artists': '',
                                'least_mainstream_track_score': 0}

      return tracks_popularity_data

    for i, track_data in enumerate(top_tracks['items']):
      average_popularity += track_data['popularity']

      if track_data['popularity'] < least_mainstream_track_score and track_data['popularity'] > 0:
        least_mainstream_track_artists = []
        for artist in track_data['artists']:
          least_mainstream_track_artists.append(artist['name'])
        least_mainstream_track_score = track_data['popularity']
        least_mainstream_track_name = track_data['name']

    tracks_popularity_data = {'number_tracks': number_tracks,
                              'average_popularity': round(average_popularity / number_tracks),
                              'least_mainstream_track_name': least_mainstream_track_name,
                              'least_mainstream_track_artists': ', '.join(least_mainstream_track_artists),
                              'least_mainstream_track_score': least_mainstream_track_score}

    return tracks_popularity_data

  def filter_user_data(self, user_data):

    return user_data['display_name']
