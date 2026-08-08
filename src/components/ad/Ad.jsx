import "./ad.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Tamu from "../../assets/tamu_flag.png";
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Cancel from "@mui/icons-material/Cancel";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Carousel from "react-simply-carousel";
import { isAdmin } from "../../utils/admin";

const Ad = ({ ad }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [reaction, setReaction] = useState(0);
  const [approved, setApproved] = useState(null); // 0 for approve, 1 for reject 
  const [selection, setSelection] = useState(null); // 0 for approve, 1 for reject 
  const [activeSlide, setActiveSlide] = useState(0);

  const containerStyle = {
    height: 0,
    paddingBottom: '25%',
    position: 'relative',
  };

  const iframeStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  // Extract non-null image URLs from the ad object
  const imageUrls = Object.keys(ad)
  .filter(key => key.startsWith('img') && ad[key] !== null)
  .map(key => ad[key]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return makeRequest.put('/ads', { approved, id: ad.id, desc: ad.desc, img0: ad.img0, img1: ad.img1, img2: ad.img2, img3: ad.img3, img4: ad.img4, img5: ad.img5, img6: ad.img6, img7: ad.img7, img8: ad.img8, img9: ad.img9, category: ad.category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ads']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (adId) => {
      return makeRequest.delete("/ads/" + adId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["ads"]);
    },
  });

  const delete_from_s3 = async (img) => {
    try {
      await makeRequest.delete(`/delete/${encodeURIComponent(img)}`);
    } catch (err) {
      console.log(err);
    }
  }
  
  const handleDelete = async () => {
    if (currentUser.id === ad.userId || isAdmin(currentUser)) {
      const img0 = ad.img0;
      const img1 = ad.img1;
      const img2 = ad.img2;
      const img3 = ad.img3;
      const img4 = ad.img4;
      const img5 = ad.img5;
      const img6 = ad.img6;
      const img7 = ad.img7;
      const img8 = ad.img8;
      const img9 = ad.img9;
      if (ad.img0 != null && ad.img0 != "") {
        await delete_from_s3(img0);
      }
      if (ad.img1 != null && ad.img1 != "") {
        await delete_from_s3(img1);
      }
      if (ad.img2 != null && ad.img2 != "") {
        await delete_from_s3(img2);
      }
      if (ad.img3 != null && ad.img3 != "") {
        await delete_from_s3(img3);
      }
      if (ad.img4 != null && ad.img4 != "") {
        await delete_from_s3(img4);
      }
      if (ad.img5 != null && ad.img5 != "") {
        await delete_from_s3(img5);
      }
      if (ad.img6 != null && ad.img6 != "") {
        await delete_from_s3(img6);
      }
      if (ad.img7 != null && ad.img7 != "") {
        await delete_from_s3(img7);
      }
      if (ad.img8 != null && ad.img8 != "") {
        await delete_from_s3(img8);
      }
      if (ad.img9 != null && ad.img9 != "") {
        await delete_from_s3(img9);
      }
    }
  };

  const isImage = (url) => {
    if (url === null) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".heic"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };
  
  const isVideo = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp4", ".m4a", ".mov", ".webp", ".mp3", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleReject = async () => {
    setApproved(false);
    const img0 = ad.img0;
    const img1 = ad.img1;
    const img2 = ad.img2;
    const img3 = ad.img3;
    const img4 = ad.img4;
    const img5 = ad.img5;
    const img6 = ad.img6;
    const img7 = ad.img7;
    const img8 = ad.img8;
    const img9 = ad.img9;
    if (ad.img0 != null && ad.img0 != "") {
      await delete_from_s3(img0);
    }
    if (ad.img1 != null && ad.img1 != "") {
      await delete_from_s3(img1);
    }
    if (ad.img2 != null && ad.img2 != "") {
      await delete_from_s3(img2);
    }
    if (ad.img3 != null && ad.img3 != "") {
      await delete_from_s3(img3);
    }
    if (ad.img4 != null && ad.img4 != "") {
      await delete_from_s3(img4);
    }
    if (ad.img5 != null && ad.img5 != "") {
      await delete_from_s3(img5);
    }
    if (ad.img6 != null && ad.img6 != "") {
      await delete_from_s3(img6);
    }
    if (ad.img7 != null && ad.img7 != "") {
      await delete_from_s3(img7);
    }
    if (ad.img8 != null && ad.img8 != "") {
      await delete_from_s3(img8);
    }
    if (ad.img9 != null && ad.img9 != "") {
      await delete_from_s3(img9);
    }
    setTimeout(() => {
      mutation.mutate();
    }, 2000);
  };

  const handleAccept = async () => {
    setApproved(true);
    setTimeout(() => {
      mutation.mutate();
    }, 2000);
  };

  const getCarousel = () => {
    return(
      <div>
        <Carousel
          containerProps={{
            style: {
              minWidth: 500,
              justifyContent: "space-between",
              userSelect: "none",
            }
          }}
          activeSlideIndex={activeSlide}
          responsiveProps={
            [{minWidth: 0, maxWidth: 10000000, forwardBtnProps: {
              children: <ArrowForwardIosIcon style={{color: "gray"}} fontSize="large"/>,
              style: {
                width: 60,
                height: 60,
                minWidth: 60,
                alignSelf: "center",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }
            },
            backwardBtnProps: {
              children: <ArrowBackIosNewIcon style={{color: "gray"}} fontSize="large"/>,
              style: {
                width: 60,
                height: 60,
                minWidth: 60,
                alignSelf: "center",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer"
              }
            }, itemsToShow: 1}, ]
          }
          swipeTreshold={20}
          onRequestChange={setActiveSlide}
          forwardBtnProps={{
            children: <ArrowForwardIosIcon style={{color: "gray"}} fontSize="large"/>,
            style: {
              width: 60,
              height: 60,
              minWidth: 60,
              alignSelf: "center",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }
          }}
          backwardBtnProps={{
            children: <ArrowBackIosNewIcon style={{color: "gray"}} fontSize="large"/>,
            style: {
              width: 60,
              height: 60,
              minWidth: 60,
              alignSelf: "center",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer"
            }
          }}
          dotsNav={{
            show: true,
            itemBtnProps: {
              style: {
                height: 14,
                width: 14,
                borderRadius: "50%",
                border: 0,
                background: "lightgray",
                marginTop: 10,
                marginRight: 2,
                marginLeft: 2
              }
            },
            activeItemBtnProps: {
              style: {
                height: 14,
                width: 14,
                borderRadius: "50%",
                border: 0,
                background: "black",
                marginTop: 10,
                marginRight: 2,
                marginLeft: 2
              }
            }
          }}
          itemsToShow={1}
          speed={400}
        >
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "240px",
                boxSizing: "border-box",
                width: 400,
                height: 400
              }}
            > 
            {isImage(imageUrl) ? <img className="image" src={imageUrl}/> 
            : 
            <video controls>
              <source src={imageUrl + "#t=0.001"} className="image" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            }
            </div>
          ))}
        </Carousel>
      </div>
    )
  }

  const getSingleFile = () => {
    if (isImage(ad.img0)) 
      return <img className="image" src={ad.img0}/>
    else if (isVideo(ad.img0)) { 
      return (
        <video controls>
          <source src={ad.img0 + "#t=0.001"} className="video" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )
    }
  }

  return (
    <div className="pendingAd">
      {approved === true ?
        <div className="thanks-container">
            <CheckCircleIcon style={{color: "green", fontSize: "3em"}}/>
            <h2>{t('ad.approved')}</h2>
            <p>{t('ad.delete')}</p>
        </div>
      :approved === false ?
        <div className="thanks-container">
            <CheckCircleIcon style={{color: "green", fontSize: "3em"}}/>
            <h2>{t('ad.rejected')}</h2>
        </div>
      :selection === 0 ?
        <div className="thanks-container">
            <CheckCircleIcon style={{color: "green", fontSize: "3em"}}/>
            <h2>{t('ad.sureApprove')}</h2>
            <div className="row">
                <button className="back" onClick={() => setSelection(null)}>{t('ad.back')}</button>
                <button className="approve" onClick={() => handleAccept()}>{t('ad.approve')}</button>
            </div>
            
        </div>
      :selection === 1?
        <div className="thanks-container">
            <Cancel style={{color: "red", fontSize: "3em"}}/>
            <h2>{t('ad.sureReject')}</h2>
            <div className="row">
                <button className="back" onClick={() => setSelection(null)}>{t('ad.back')}</button>
                <button className="reject" onClick={() => handleReject()}>{t('ad.reject')}</button>
            </div>
        </div>
      :
        <div className="container">
            <div className="user">
            <div className="userInfo">
                <img src={ad.profilePic} alt="" />
                <div className="details">
                <Link
                    to={`/profile/${ad.userId}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <span className="name">{ad.username}</span>
                </Link>
                <span className="date">{moment(ad.createdAt).fromNow()}</span>
                </div>
            </div>
            <div className = "approve">
                <div className = "icon">
                    <CheckCircleIcon style={{color: "green"}} onClick={() => setSelection(0)}/>
                </div>
                <div className = "icon">
                    <Cancel style={{color: "red"}} onClick={() => setSelection(1)}/>
                </div>
            </div>
            </div>
            
            <div className="content">
              {ad.desc}
              <div className="centered">
                {ad.img1 === null ? getSingleFile() : getCarousel()}
                {ad.flag === 1 && 
                  <img className="file" src={Tamu}/>
                }
              </div>
            </div>
        </div>
      }
    </div>
  );
};

export default Ad;
