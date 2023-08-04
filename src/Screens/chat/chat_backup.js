import React, { useEffect, useState, useRef } from "react";
import NavBar from "../../components/navBar";
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';
import usePlayAudio from "../../Hooks/usePlayAudio";
import ClickAwayListener from '@mui/base/ClickAwayListener';
import useWindowSize from "../../Hooks/useWindowSize";
import {
  ChatBody,
  ChatFooter,
  ChatHeader,
  ChatScreenWrapper,
  MessagePanel,
  EnterMessage,
  SectionTwo,
  SectionOne,
  ImageIcon,
  LeftSection,
  ImageChatBackground,
  RightSection,
  MessageWrapper,
  BotMessage,
  MessageActionsBot,
  UserMessage,
  UserMessageWrapper,
  CustomOverlay,
  TranslatrionWrapper,
  BotMessageTranslation,
  MessageActionsBotTranslation,
  UserMessageTranslation,
  UserMessageTranslationBottom,
  LineBreakDiv,
  TimeStamp,
  TimeStampWhite,
  AudioHiddenContainer,
  AutoPlayWrapper,
  MuteText,
  DesktopTimeStamp,
  MobileTimeStamp,
  BotMessageTyping
} from "./chatStyle";
import { getMessageList, sendMessage, translateMessage, getAudioLink } from "../../AppRedux/actions/user";
import {
  getLSItem,
  setLSItem,
  handleSpeak,
  handleTranslate,
} from "../../utilities/general";

function Chat() {
  const dispatch = useDispatch();
  const [isReset, setIsReset] = useState(0);
  const [messageList, setMessageList] = useState([]);
  const [isLoading, setLoader] = useState(false);
  const [showRecordAnimation, setShowRecordAnimation] = useState(false);
  const mimeType = "audio/mpeg";
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const mediaRecorder = useRef(null);
  const translationRef = useRef(null)
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [translationIndex, setTranslationIndex] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [translationLoader, setTranslationLoader] = useState(false);
  const [audioContent, setAudioContent] = useState(null);
  const [audioLoader, setAudioLoader] = useState(false);
  const [translationHeight, setTranslationHeight] = useState(0);
  const [audioPlayIndex, setAudioPlayIndex] = useState(null);
  const [translatedAudio, setTranslatedAudio] = useState(null);
  const [audioSignedUrl, setAudioSignedUrl] = useState(null);
  const [autoPlayMute, setAutoPlayMute] = useState(getLSItem("mute"));
  const [isLineBreakMessage, setLineBreakMessage] = useState(false);
  const audioRef = useRef();
  const voiceRef = useRef();
  const windowSize = useWindowSize();
  // let audioLink = null

  const {
    sendMessageBegin,
    sendMessageSuccessData,
    sendMessageFailureData,
    getMessageListBegin,
    getMessageListSuccessData,
    getMessageListFailureData,
    getTranslatedSuccessData,
    getTranslatedFailureData,
    getAudiolinkSuccessData,
    getAudiolinkFailureData
  } = useSelector(({ user }) => user);

  const [input, setInput] = useState("");

  let formData = new FormData();
  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const isEnter = (event) => {
    if (event.key === "Enter") {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
      formData.append("message", input);
      formData.append("language", getLSItem("lang_id"));
      formData.append("is_reset", isReset);
      setLoader(true);
      dispatch(sendMessage(formData));
    }
  };
  usePlayAudio();
  useEffect(() => {
    dispatch(getMessageList());
    getMicrophonePermission()
  }, []);

  useEffect(() => {
    if (getMessageListSuccessData) {
      setMessageList(getMessageListSuccessData?.data[0]?.data);
      setTimeout(() => {
        scrollToBottom();
      }, 2000);
    }
  }, [getMessageListSuccessData]);

  useEffect(() => {
    if (sendMessageSuccessData) {
      if(sendMessageSuccessData?.msg && !autoPlayMute && !isLineBreakMessage){
        playFunc(sendMessageSuccessData?.msg, getLSItem("lang_id"))
      }
      setLineBreakMessage(false)
      setLoader(false);
      setInput("");
      dispatch(getMessageList());
      setTimeout(() => {
        inputRef?.current?.focus();
        scrollToBottom();
      }, 2000);
    }
  }, [sendMessageSuccessData]);

  useEffect(() => {
    if (sendMessageFailureData) {
      setLoader(false);
    }
  }, [sendMessageFailureData]);

  useEffect(() => {
    if(getTranslatedSuccessData && getTranslatedSuccessData.translated_text){
      setTranslatedText(getTranslatedSuccessData.translated_text);
      setTranslationLoader(false)
    }
  }, [getTranslatedSuccessData]);

  useEffect(() => {
    if(getTranslatedFailureData){
      setTranslationLoader(false)
    }
  }, [getTranslatedFailureData]);

  
  useEffect(() => {
    if(getAudiolinkSuccessData){
      setAudioSignedUrl(getAudiolinkSuccessData?.url)
      setAudioLoader(false)
    }
  }, [getAudiolinkSuccessData]);

  useEffect(() => {
    if(getAudiolinkFailureData){
      setAudioSignedUrl(null)
      setAudioLoader(false)
    }
  }, [getAudiolinkFailureData]);

  useEffect(() => {
    if (audioContent) {
      audioContent.play();
      setAudioContent(null)
    }
  }, [audioContent]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const sendVoiceMessageData = (aBlob) => {
    if (aBlob) {
        let formData = new FormData();
        formData.append("language", getLSItem("lang_id"));
        formData.append("file", aBlob, "recorded.mp3");
        setLoader(true);
        setTimeout(() => {
          scrollToBottom();
        }, 200);
        dispatch(sendMessage(formData))
        setTimeout(() => {
          setLoader(false);
        }, 5000);
        
    }
  };
  const onTranslate = async (msg, lang, idx) => {
    setTranslationLoader(true)
    setTranslationIndex(idx);
    let formData = {
      language: getLSItem("lang_id"),
      message: msg
    };
    
    
    dispatch(translateMessage(formData));
    // setTranslationLoader(false)
    // if(response && response?.translatedText){
    //   setTranslatedText(response?.translatedText);
    // }
  };

  const onCloseTranslation = () => {
    setTranslationIndex(null);
    setTranslatedText("");
  };

  const handleMouseUp = (idx) => {
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText !== "") {
      setTranslationIndex(idx);
      onTranslate(selectedText, null, idx)
    }
  };

  const onStartRecording = async () => {
    setRecordingStatus("recording");
      //create new Media recorder instance using the stream
      const media = new MediaRecorder(stream, { type: mimeType });
      //set the MediaRecorder instance to the mediaRecorder ref
      mediaRecorder.current = media;
      //invokes the start method to start the recording process
      mediaRecorder.current.start();
      let localAudioChunks = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
  }

  const onStopRecording = () => {
    if(recordingStatus === 'recording'){
      setRecordingStatus("inactive");
      //stops the recording instance
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        //creates a blob file from the audiochunks data
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        sendVoiceMessageData(audioBlob)
        //creates a playable URL from the blob file.
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        setAudioChunks([]);
      };
    }
    
  };

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            setPermission(true);
            setStream(streamData);
            
        } catch (err) {
            alert(err.message);
        }
    } else {
        alert("The MediaRecorder API is not supported in your browser.");
    }
};
const onHandleSpeak = (msg, lang, idx) => {
    setAudioLoader(true)
    if(audioPlayIndex && audioPlayIndex === idx && !audioRef?.current?.paused){
      audioRef?.current?.paused;
      setTranslatedAudio(null)
      setAudioPlayIndex(null)
      setAudioLoader(false)
    } else {
      setAudioPlayIndex(idx)
      playFunc(msg, lang)

    }
}

const onHandleVoice = (msg, lang, idx) => {

  setAudioLoader(true)
  if(audioPlayIndex && audioPlayIndex === idx && !voiceRef?.current?.paused){
    voiceRef?.current?.paused;
    setAudioSignedUrl(null)
    setAudioPlayIndex(null)
    setAudioLoader(false)
  } else {
    getAudioUrl(msg)
    setAudioPlayIndex(idx)
  }
}

const getAudioUrl = async (aUrl) => {
  dispatch(getAudioLink(aUrl));
}
const playFunc = async (msg, lang) => {
  const response = await handleSpeak(msg, lang)
  if(response && response.audioContent){
    // audioLink = new Audio(`data:audio/mp3;base64,${response.audioContent}`);
    // audioLink.play()
    setTranslatedAudio(response.audioContent)
    setAudioLoader(false)
  }
}

const addLineBreak = () => {
  if(!isLoading && messageList?.length > 0){
    let fData = new FormData()
    fData.append("message", 'line-break');
    fData.append("language", getLSItem("lang_id"));
    fData.append("is_reset", 1);
    setLoader(true);
    setLineBreakMessage(true)
    dispatch(sendMessage(fData));

  }
}

useEffect(() => {
  if(translationRef?.current){
    setTranslationHeight(translationRef?.current?.clientHeight)
  }
}, [translationRef.current]);

const getTimeStamp = (datetime) => {
  let date = moment.utc(datetime).local();
  return date.format('DD-MMM-YYYY HH:mm A')
}

const toggleAutoPlay = () => {
  setLSItem("mute", !autoPlayMute);
  setAutoPlayMute(!autoPlayMute)
}

  return (
    <ChatScreenWrapper>
      {/* {isLoading && (
        <CustomOverlay>
          <img src="/Icons/loader.gif" alt="Loader" />
        </CustomOverlay>
      )} */}
      <ChatHeader>
        <NavBar />
      </ChatHeader>
      <ChatBody>
        <AudioHiddenContainer>
          {translatedAudio && <audio ref={audioRef} autoPlay src={`data:audio/mp3;base64,${translatedAudio}`} controls></audio> }
          {audioSignedUrl && <audio ref={voiceRef} autoPlay src={audioSignedUrl} controls></audio> }
        
        </AudioHiddenContainer>
        <LeftSection>
          <ImageChatBackground
            src="/Icons/humanoid.png"
            alt="chatBackground"
          />
        </LeftSection>
        <RightSection>


       {(translationIndex === 0 || translationIndex === 1) && translationHeight && !translationLoader && <div style={{marginTop: windowSize?.width < 550 ? translationHeight * 1.5 : translationHeight}}></div>}
          <div ref={messagesEndRef}>
            {messageList?.map((val, index) => {
              if(messageList[index-1]?.context_id && val?.context_id && messageList[index-1]?.context_id !== val?.context_id ){
                return (
                  <>
                    <LineBreakDiv />
                  </>
                )
              }
              if (val?.type == 2 && messageList[index-1]?.message !== 'line-break' )
                return (
                  <MessageWrapper>
                    {translationIndex === index && (
                      <ClickAwayListener onClickAway={onCloseTranslation}>
                        <TranslatrionWrapper>
                          <BotMessageTranslation>
                          {translationLoader ? <img width={30} height={30} src="/Icons/loader.gif" alt="Loader" /> :
                            <span>{translatedText}</span>}
                            <MessageActionsBotTranslation>
                              <img
                                src="/Icons/closeButton.svg"
                                alt="closeButton"
                                onClick={(e) => onCloseTranslation()}
                              />
                            </MessageActionsBotTranslation>
                          </BotMessageTranslation>
                        </TranslatrionWrapper>
                      </ClickAwayListener>
                    )}
                    <BotMessage key={index}>
                      <span onMouseUp={() => handleMouseUp(index)}>
                        {val?.message}
                        <DesktopTimeStamp>
                          <TimeStamp>{getTimeStamp(val?.created_date)}</TimeStamp>
                        </DesktopTimeStamp>
                      </span>
                      <MessageActionsBot>
                        <img
                          src="/Icons/speaker.svg"
                          alt="Image Description"
                          style={{opacity: audioLoader ? 0.5 : 1}}
                          onClick={(e) =>{

                            if(audioLoader){
                            } else {
                              onHandleSpeak(val?.message, val?.language, index)
                            }}
                          }
                        />
                        <img
                          src="/Icons/translate.svg"
                          alt="Image Description"
                          onClick={() =>
                            onTranslate(val?.message, val?.language, index)
                          }
                        />
                      </MessageActionsBot>
                      <MobileTimeStamp>
                        <TimeStamp>{getTimeStamp(val?.created_date)}</TimeStamp>
                      </MobileTimeStamp>
                    </BotMessage>
                  </MessageWrapper>
                );

              if (val?.type == 1)
                return (
                  <UserMessageWrapper ref={translationRef} >
                    {translationIndex === index && (
                      <ClickAwayListener onClickAway={onCloseTranslation}>
                        <UserMessageTranslation>
                          {translationLoader ? <img width={30} height={30} src="/Icons/loader.gif" alt="Loader" /> :
                            <span>
                              {translatedText}
                            </span>}
                          <MessageActionsBotTranslation>
                            <img
                              src="/Icons/closeButton.svg"
                              alt="closeButton"
                              onClick={(e) => onCloseTranslation()}
                            />
                          </MessageActionsBotTranslation>
                        </UserMessageTranslation>
                      </ClickAwayListener>
                    )}
                    <UserMessage key={index}>
                     <MessageActionsBot>
                      {val?.message && <img
                          onClick={() =>
                            onTranslate(val?.message, val?.language, index)
                          }
                          src="/Icons/whiteTranslate.svg"
                          alt="Image Description"
                        /> }
                       {val?.audio_url && <img
                          src="/Icons/speaker-white.png"
                          alt="Image Description"
                          style={{opacity: audioLoader ? 0.5 : 1}}
                          onClick={(e) =>{

                            if(audioLoader){
                            } else {
                              onHandleVoice(val?.audio_url, val?.language, index)
                            }
                          }}
                        />}
                      </MessageActionsBot>
                      <span onMouseUp={() => handleMouseUp(index)}>
                        {val?.message}
                        {/* <TimeStampWhite>{getTimeStamp(val?.created_date)}</TimeStampWhite> */}
                      </span>
                      <div>
                      {/* {val?.audio_url && <audio src={val?.audio_url} controls></audio>  } */}
                      <TimeStampWhite>{getTimeStamp(val?.created_date)}</TimeStampWhite>
                      </div>
                    </UserMessage>
                  </UserMessageWrapper>
                );
            })}
             <MessageWrapper>
              {isLoading && <BotMessageTyping style={{paddingBottom: '10px', marginBottom: '30px'}}>
                <img
                  src="/Icons/typing.gif"
                  alt="Typing"
                  style={{opacity: audioLoader ? 0.5 : 1}}
                />
              </BotMessageTyping>}
             </MessageWrapper>
          </div>
        </RightSection>
      </ChatBody>
      <ChatFooter height={windowSize?.height}>
        <MessagePanel height={windowSize?.height}>
          <SectionOne style={{cursor: messageList?.length ? 'pointer' : 'not-allowed' }} onClick={addLineBreak}>
            <ImageIcon src="/Icons/message1.svg" />
          </SectionOne>
          <SectionTwo>
            <EnterMessage
              ref={inputRef}
              type="text"
              value={input}
              disabled={isLoading}
              placeholder="Send a message"
              onChange={(e) => handleInput(e)}
              onKeyDown={(e) => isEnter(e)}
            />
            {(showRecordAnimation === false && recordingStatus === 'inactive') ? (
              <ImageIcon
                src="/Icons/voice.svg"
                style={{ cursor: "pointer", width: windowSize?.height < 450 ? '20px' : '28px' }}
                onClick={() => {
                  if(!isLoading){
                    !permission ? getMicrophonePermission() : onStartRecording();
                    setShowRecordAnimation(true);
                  }
                }}
              />
            ) : (
              <>
                <ImageIcon
                  src="/Icons/icons8-audio-wave.gif"
                  style={{ cursor: "pointer", width: windowSize?.height < 450 ? '20px' : '28px' }}
                  onClick={() => {
                    onStopRecording()
                    setShowRecordAnimation(false);
                  }}
                />

                <ImageIcon
                  src="/Icons/chatClose.svg"
                  style={{
                    cursor: "pointer",
                    width: windowSize?.height < 450 ? '14px' : '20px',
                    marginLeft: "10px",
                    color: "red",
                  }}
                  onClick={() => {
                    onStopRecording();
                    setShowRecordAnimation(false);
                  }}
                />
              </>
            )}

          </SectionTwo>
        </MessagePanel>
        <AutoPlayWrapper onClick={toggleAutoPlay}>
          {/* <MuteText>{autoPlayMute ? 'Unmute' : 'Mute'}</MuteText> */}
          <img
            height={autoPlayMute ? '30px' : '30px'}
            src={autoPlayMute ? "/Icons/mute.png" : "/Icons/unmute.png"}
            alt="Image Description"
          />
        </AutoPlayWrapper>
      </ChatFooter>
    </ChatScreenWrapper>
  );
}

export default Chat;
