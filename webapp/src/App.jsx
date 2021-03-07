import './App.css';
import './Spinner.css';
import React, {useState, useEffect} from "react";
import axios from 'axios';
import html2canvas from "html2canvas";
import {useHistory, withRouter} from 'react-router-dom';
import TopButton from "./Button/TopButton";
import TermButton from "./Button/TermButton";
import SaveButton from "./Button/SaveButton";
import ShowAllButton from "./Button/ShowAllButton";
import GithubCorner from 'react-github-corner';
import Card from "./Card/Card";
import Popularity from "./Textfield/Popularity";
import Headline from "./Textfield/Headline";
import AudioFeature from "./Textfield/AudioFeature";
import Collage from "./Collage/Collage";

const App = () => {

  const leastMainstreamEmoji = '🎧'
  const [audioFeatures, setAudioFeatures] = useState([]);
  const [energyEmoji, setEnergyEmoji] = useState('')
  const [danceabilityEmoji, setDanceabilityEmoji] = useState('')
  const [tempoEmoji, setTempoEmoji] = useState('')
  const [happinessEmoji, setHappinessEmoji] = useState('')
  const [tracksPopularityEmoji, setTracksPopularityEmoji] = useState('')
  const [artistsPopularityEmoji, setArtistsPopularityEmoji] = useState('')

  const [topVisible, setTopVisible] = useState('top tracks')
  const [termSelected, setTermSelected] = useState('medium_term')
  const [term, setTerm] = useState('medium_term');
  const [termText, setTermText] = useState('this year')
  const [areCardsVisible, setAreCardsVisible] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showTextMessage, setShowTextMessage] = useState('show all')
  const [isLoading, setIsLoading] = useState(true)

  const [artistsData, setArtistsData] = useState([]);
  const [tracksData, setTracksData] = useState([]);
  const [userData, setUserData] = useState(['my']);
  const [tracksPopularity, setTracksPopularity] = useState([]);
  const [artistsPopularity, setArtistsPopularity] = useState([]);
  const [tracksCollage, setTracksCollage] = useState([]);
  const [artistsCollage, setArtistsCollage] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const generateCollageText = () => {
      switch (termSelected) {
        case 'short_term': {
          setTermText('this month')
          break;
        }

        case 'long_term': {
          setTermText('of all time')
          break;
        }

        default: {
          setTermText('this year')
          break;
        }
      }
    }

    let url;
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      url = "http://localhost:3000"
    } else {
      url = "https://api.wrapped.mudi.me"
    }
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    axios.get(`${url}/api/top/?term=${term}&spotify_token=${accessToken}`)
      .then(
        res => {
          let audio = res.data.audio_features;
          let tracks = res.data.tracks_popularity;
          let artists = res.data.artists_popularity;

          setUserData(`${res.data.user_data}'s`)
          setArtistsData(res.data.artists_data);
          setTracksData(res.data.tracks_data);
          setTracksCollage(res.data.tracks_collage);
          setArtistsCollage(res.data.artists_collage);
          setIsLoading(false)
          setAudioFeatures(audio)
          setTracksPopularity(tracks);
          setArtistsPopularity(artists);

          generateAudioEmoji(audio, tracks, artists);
          generateCollageText();
        })
      .catch(function (error) {
        console.log(error);
        if (error.response.status === 400) {
          history.push('/')
        }
      });
  }, [history, term, termSelected])


  const generateAudioEmoji = (audio, tracks, artists) => {
    let danceability = audio.danceability;
    let energy = audio.energy;
    let tempo = audio.tempo;
    let happiness = audio.happiness;
    let tracks_popularity = tracks.average_popularity;
    let artists_popularity = artists.average_popularity;

    const emojiList = [
      [[0, 1.7], '🧍🧍🧍', '💤💤💤', '😫😫😫', '👤👤👤'],
      [[1.7, 3.3], '🧍🧍', '💤💤', '😫😫', '👤👤'],
      [[3.3, 5.0], '🧍', '💤', '😫', '👤'],
      [[5.0, 6.7], '💃', '⚡', '😆', '🔥'],
      [[6.7, 8.4], '💃💃', '⚡⚡', '😆😆', '🔥🔥'],
      [[8.4, 10.0], '💃💃💃', '⚡⚡⚡', '😆😆😆', '🔥🔥🔥']
    ]

    const tempoEmoji = [
      [[0, 40], '🐌🐌🐌'],
      [[40, 66], '🐌🐌'],
      [[66, 76], '🐌'],
      [[76, 120], '🚀'],
      [[120, 168], '🚀🚀'],
      [[168, Number.MAX_VALUE], '🚀🚀🚀']
    ]

    for (let i = 0; i < 6; i++) {
      let valueRange = emojiList[i][0];
      let begin = valueRange[0];
      let end = valueRange[1];

      if (danceability >= begin && danceability <= end) {
        setDanceabilityEmoji(emojiList[i][1]);
      }
      if (energy >= begin && energy <= end) {
        setEnergyEmoji(emojiList[i][2]);
      }
      if (happiness >= begin && happiness <= end) {
        setHappinessEmoji(emojiList[i][3]);
      }
      if (tracks_popularity >= begin && tracks_popularity <= end) {
        setTracksPopularityEmoji(emojiList[i][4]);
      }
      if (artists_popularity >= begin && artists_popularity <= end) {
        setArtistsPopularityEmoji(emojiList[i][4]);
      }
    }

    for (let i = 0; i < 6; i++) {
      let valueRange = tempoEmoji[i][0];
      let begin = valueRange[0];
      let end = valueRange[1];
      if (tempo >= begin && tempo <= end) {
        setTempoEmoji(tempoEmoji[i][1]);
      }
    }
  }



  const toCanvas = () => {
    let category;
    if (topVisible === 'top tracks') {
      category = '#tracks_img'
    }
    if (topVisible === 'top artists') {
      category = '#artists_img'
    }

    window.scrollTo(0, 0);
    html2canvas(document.querySelector(category), {
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      let a = document.createElement('a');
      a.download = "artists_collage.png";
      a.href = canvas.toDataURL();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      a = null;
    });
  }

  const toggleCardsButton = () => {
    if (showText === true) {
      setShowTextMessage("show all");
    }
    if (showText === false) {
      setShowTextMessage("hide all");
    }
  }

  const resetCardsButton = () => {
    setAreCardsVisible(false);
    setShowText(false);
    setShowTextMessage('show all');
  }

  const application = <>
    <div className="audio-feature-texfield">
      <AudioFeature
        emoji={danceabilityEmoji}
        category='danceability'
        score={audioFeatures.danceability}
        scale='/10'/>
      <AudioFeature
        emoji={energyEmoji}
        category='energy'
        score={audioFeatures.energy}
        scale='/10'/>
      <AudioFeature
        emoji={tempoEmoji}
        category='tempo'
        score={audioFeatures.tempo}
        scale=' bpm'/>
      <AudioFeature
        emoji={happinessEmoji}
        category='happiness'
        score={audioFeatures.happiness}
        scale='/10'/>
    </div>

    <div className="top-buttons">
      <TopButton
        onClick={() => {
          setTopVisible('top tracks');
          setAreCardsVisible(false);
          resetCardsButton();
        }}
        category={'tracks'}
        isSelected={topVisible === "top tracks"}/>

      <TopButton
        onClick={() => {
          setTopVisible('top artists');
          setAreCardsVisible(false);
          resetCardsButton();
        }}
        category={'artists'}
        isSelected={topVisible === "top artists"}/>
    </div>

    <div className="popularity-textfield">
      <Popularity
        popularityEmoji={artistsPopularityEmoji}
        leastMainstreamEmoji={leastMainstreamEmoji}
        averagePopularity={artistsPopularity.average_popularity}
        name={artistsPopularity.least_mainstream_artist_name}
        link={artistsPopularity.least_mainstream_artist_url}
        isVisible={topVisible === 'top artists'}/>

      <Popularity
        popularityEmoji={tracksPopularityEmoji}
        leastMainstreamEmoji={leastMainstreamEmoji}
        averagePopularity={tracksPopularity.average_popularity}
        name={tracksPopularity.least_mainstream_track_name}
        link={tracksPopularity.least_mainstream_track_url}
        isVisible={topVisible === 'top tracks'}/>
    </div>

    <div className="collage">
      <div style={{"overflow": "scroll"}}>
        <Collage id="tracks_img"
                 category="tracks"
                 term={termText}
                 images={tracksCollage}
                 isVisible={topVisible === 'top tracks'}/>
      </div>

      <div style={{"overflow": "scroll"}}>
        <Collage id="artists_img"
                 category="artists"
                 term={termText}
                 images={artistsCollage}
                 isVisible={topVisible === 'top artists'}/>
      </div>
    </div>

    <div className="save-and-share">
      <SaveButton onClick={toCanvas}
                  isVisible={topVisible === 'top tracks'}/>
      <SaveButton onClick={toCanvas}
                  isVisible={topVisible === 'top artists'}/>
    </div>

    <div className="all-cards">
      {React.Children.toArray(
        tracksData.map((track_data) => (
          <Card
            areCardsVisible={areCardsVisible}
            backgroundUrl={track_data.track_background}
            link={track_data.track_url}
            text={`${track_data.track_rank} ${track_data.track_name}`}
            subtext={track_data.track_artists}
            isCardVisible={topVisible === 'top tracks'}/>
        )))}

      {React.Children.toArray(
        artistsData.map((artist_data) => (
          <Card
            areCardsVisible={areCardsVisible}
            backgroundUrl={artist_data.artist_background}
            link={artist_data.artist_url}
            text={`${artist_data.artist_rank} ${artist_data.artist_name}`}
            subtext={artist_data.artist_followers}
            isCardVisible={topVisible === 'top artists'}/>
        )))}
    </div>

    <ShowAllButton
      onClick={() => {
        setAreCardsVisible(!areCardsVisible)
        setShowText(!showText)
        toggleCardsButton();
      }}
      show={showTextMessage + ' ' + topVisible}/></>;

  return (
    <div className="App">

      <GithubCorner href="https://github.com/mudassarzahid/miniwrap"/>

      <div id="wrapper">
        <div className="container">

          <div className="built-by">built by <a href="https://twitter.com/mudassar_z" target="_blank"
                                                rel="noreferrer">Mudi</a></div>

          <Headline username={userData}/>

          <div className="term-buttons">
            <TermButton
              onClick={() => {
                setTermSelected('short_term');
                setTerm('short_term')
                setAreCardsVisible(false);
                resetCardsButton();
              }}
              value="short_term"
              termdesc="4 weeks"
              isSelected={termSelected === 'short_term'}/>

            <TermButton
              onClick={() => {
                setTermSelected('medium_term');
                setTerm('medium_term')
                setAreCardsVisible(false);
                resetCardsButton();
              }}
              value="medium_term"
              termdesc="6 months"
              isSelected={termSelected === 'medium_term'}/>

            <TermButton
              onClick={() => {
                setTermSelected('long_term');
                setTerm('long_term')
                setAreCardsVisible(false);
                resetCardsButton();
              }}
              value="long_term"
              termdesc="all time"
              isSelected={termSelected === 'long_term'}/>
          </div>

          {isLoading && <div className="spinner">
            <div className="rect1"/>
            <div className="rect2"/>
            <div className="rect3"/>
            <div className="rect4"/>
            <div className="rect5"/>
          </div>}

          {!isLoading && application}

        </div>
      </div>
    </div>
  );
}

export default withRouter(App);
