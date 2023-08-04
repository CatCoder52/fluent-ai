import { useEffect } from "react";

const usePlayAudio = () => {
  const HandlePlay = (e) => {
    const audios = document.getElementsByTagName('audio');
    for(var i = 0, len = audios.length; i < len;i++){
        if(audios[i] != e.target){
          audios[i].pause();
        }
    }
  };

  useEffect(() => {
    const callback = (event) => {
      HandlePlay(event);
    }
  
    document.addEventListener("play", callback, true);
    return () => {
      document.removeEventListener("play", callback, true);
    };
  }, []);
};

export default usePlayAudio;
