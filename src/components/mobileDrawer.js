import React, { useState } from "react";
import {
  DrawerBody,
  ModalFooter,
  MobileNavBar,
  MobileDrawerWrapper,
  NavChild2
} from "./referralsStyle";
import {
  Language,
  LanguageFlagWrapper,
  LanguageSelected

} from "./navBarStyle";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DrawerComponent from "./Common/Drawer/drawer";
import Referral from "./referrals";
import { getLSItem } from "../utilities/general";
import MobileLanguageSelect from "./mobileLanguageSelect";

const fluencyMap = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Fluent",
  5: "Native"
}

export default function MobileDrawer({ onClose, handleLogout, toggleConfiguration }) {
  const { pathname } = useLocation();
  const [showReferralDrawer, setShowReferralDrawer] = useState(false);
  const [showLanguageModal, setLanguageModal] = useState(false);


  const toggleReferralDrawer = () => {
    setShowReferralDrawer(!showReferralDrawer);
  };

  const onLogout = () => {
    onClose()
    handleLogout()
  }

  const onLanguageSelect = () => {
    setLanguageModal(true)
  }

  const closeLanguageModal = () => {
    setLanguageModal(false)
    onClose()
  }

  return (
    <MobileDrawerWrapper>
      <MobileNavBar>
        <img src="/Icons/closeButton.svg" alt="closeButton" onClick={onClose} />
      </MobileNavBar>
      <DrawerBody>
          <NavChild2>
            <p>{JSON.parse(getLSItem("user_data"))?.email}</p>
          </NavChild2>
          {!pathname.includes("/select") && <NavChild2 onClick={onLanguageSelect}>
              <Language>
                <LanguageFlagWrapper>
                  {getLSItem("lang_id") == 1 ? (
                    <img src="/Development/language.png" alt="imag" />
                  ) : (
                    <img src="/Development/spanish.svg" alt="imag" />
                  )}
                </LanguageFlagWrapper>

                <LanguageSelected>
                  <span>
                    {getLSItem("lang_id") == 1 ? "Mandarin" : "Spanish"}
                  </span>
                  <div>{fluencyMap[getLSItem("fluency_level")]}</div>
                </LanguageSelected>
              </Language>
          </NavChild2>}
          <NavChild2 onClick={toggleReferralDrawer}>
            <img src="/Icons/contactsPlus.svg" alt="contacts plus" />
          </NavChild2>
          <NavChild2>
            <Link target={"_blank"} to="FormLink">
              <img src="/Icons/contactsPlusFigma.svg" alt="message" />
            </Link>
          </NavChild2>
          <NavChild2 onClick={onLogout}>
            <img src="/Icons/exit.svg" alt="Exit" />
            <span>Logout</span>
          </NavChild2>
          
          <DrawerComponent anchor={"right"} triggerDrawer={showReferralDrawer}>
            <div>
              <Referral onClose={() => setShowReferralDrawer(false)} />
            </div>
          </DrawerComponent>
      </DrawerBody>
      <ModalFooter>
        
      </ModalFooter>
      {showLanguageModal && <MobileLanguageSelect onCloseModal={closeLanguageModal} />}
      
    </MobileDrawerWrapper>
  );
}
