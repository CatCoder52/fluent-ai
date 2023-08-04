import React, { useEffect, useState } from "react";
import ConfigurationDropDown from "./configurationDropDown";
import LogOutButton from "./logOutButton";
import {
  AvartarImageWrapper,
  Language,
  LanguageAction,
  LanguageActionImageWrapper,
  LanguageFlagWrapper,
  LanguageSelected,
  Logo,
  LogoText,
  NavBarWrapper,
  NavChild1,
  NavChild2,
  NavChild3,
  NavChild4,
  NavChild5,
  NavLeftSection,
  NavRightSection,
  NavigationBar,
  ModalWrapper,
  UserEmail,
  LanguageSelectedNavBar
} from "./navBarStyle";
import { ModalOuter } from "./ModalOuter";
import ConfirmationModal from "./confirmationModal";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../AppRedux/actions/user";
import DrawerComponent from "./Common/Drawer/drawer";
import Referral from "./referrals";
import MobileDrawer from "./mobileDrawer";
import { useLocation } from "react-router-dom";
import { getLSItem } from "../utilities/general";
import { OutsideClickCloseContainer } from "./OutsideClickContainer";
export default function NavBar() {
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showReferralDrawer, setShowReferralDrawer] = useState(false);
  const [logoutConfirmation, setLogoutConfirmation] = useState(false);
  const [showMobileDrawer, setMobileDrawer] = useState(false);
  const [logoutPopover, setLogoutPopover] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logoutUserBegin, logoutUserSuccessData, logoutUserFailureData } =
    useSelector(({ user }) => user);

  const fluencyMap = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Fluent",
    5: "Native"
  }
  const toggleConfiguration = () => {
    setShowConfiguration((prevShowConfiguration) => !prevShowConfiguration);
  };
  const toggleReferralDrawer = () => {
    setShowReferralDrawer(!showReferralDrawer);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawer(!showMobileDrawer);
  };

  const handleLogout = () => {
    setLogoutConfirmation(true);
    setLogoutPopover(false);
  };
  useEffect(() => {
    if (logoutUserSuccessData) navigate("/login");
  }, [logoutUserSuccessData]);
  return (
    <NavBarWrapper>
      <NavigationBar>
        <NavLeftSection>
          <Logo onClick={() => navigate("/chat")}>
            {/* <img src="/Logo/LogoSplit/logoIcon1.svg" alt="logoIcon1.svg" />
            <LogoText>
              <img src="/Logo/LogoSplit/logoMainText2.svg" alt="LogoSubText" />
              <img src="/Logo/LogoSplit/logoSubText3.svg" alt="LogoText" />
            </LogoText> */}
             <img style={{width: '125px'}} src="/Icons/logo.png" alt="logoIcon1.svg" />
          </Logo>
        </NavLeftSection>
        <NavRightSection>
          {!pathname.includes("/select") && (
            <NavChild1>
              <Language>
                <LanguageFlagWrapper>
                  {getLSItem("lang_id") == 1 ? (
                    <img src="/Development/language.png" alt="imag" />
                  ) : (
                    <img src="/Development/spanish.svg" alt="imag" />
                  )}
                </LanguageFlagWrapper>

                <LanguageSelectedNavBar>
                  <span>
                    {getLSItem("lang_id") == 1 ? "Mandarin" : "Spanish"}
                  </span>
                  <div>{fluencyMap[getLSItem("fluency_level")]}</div>
                </LanguageSelectedNavBar>
                <LanguageAction>
                  <LanguageActionImageWrapper onClick={toggleConfiguration}>
                    <img src="/Icons/downArrow.svg" alt="downArrow" />
                  </LanguageActionImageWrapper>
                </LanguageAction>
              </Language>
            </NavChild1>
          )}
          <NavChild2 onClick={toggleReferralDrawer}>
            <img src="/Icons/contactsPlus.svg" alt="contacts plus" />
          </NavChild2>
          <NavChild3>
            <Link target={"_blank"} to="FormLink">
              <img src="/Icons/contactsPlusFigma.svg" alt="message" />
            </Link>
          </NavChild3>
          <NavChild4>
            <div onClick={() => setLogoutPopover(!logoutPopover)}>
              <UserEmail>{JSON.parse(getLSItem("user_data"))?.email}</UserEmail>
              <AvartarImageWrapper>
                <img src="/Icons/contactsAvatar.svg" alt="Image Description" />
              </AvartarImageWrapper>
            </div>
          </NavChild4>
          <NavChild5 onClick={toggleMobileDrawer} handleLogout={handleLogout}>
            <div onClick={() => setLogoutPopover(!logoutPopover)}>
              <AvartarImageWrapper>
                <img
                  height={20}
                  width={20}
                  src="/Icons/hamburger.png"
                  alt="HamBurger"
                />
              </AvartarImageWrapper>
            </div>
          </NavChild5>
        </NavRightSection>
      </NavigationBar>

      <ModalWrapper>
        <OutsideClickCloseContainer setState={setShowConfiguration}>
          {showConfiguration && <ConfigurationDropDown />}
        </OutsideClickCloseContainer>

        {logoutPopover && (
          <LogOutButton
            handleLogout={handleLogout}
            setLogoutPopover={setLogoutPopover}
          />
        )}
      </ModalWrapper>

      <OutsideClickCloseContainer setState={setLogoutConfirmation}>
        {logoutConfirmation && (
          <ModalOuter
            state={logoutConfirmation}
            setState={setLogoutConfirmation}
          >
            <ConfirmationModal
              setState={setLogoutConfirmation}
              yesClick={() => dispatch(logoutUser())}
            />
          </ModalOuter>
        )}
      </OutsideClickCloseContainer>
      <DrawerComponent anchor={"right"} triggerDrawer={showReferralDrawer}>
        <div>
          <Referral onClose={() => setShowReferralDrawer(false)} />
        </div>
      </DrawerComponent>
      <DrawerComponent anchor={"right"} triggerDrawer={showMobileDrawer}>
        <div>
          <MobileDrawer onClose={() => setMobileDrawer(false)} toggleConfiguration={toggleConfiguration} handleLogout={handleLogout}/>
        </div>
      </DrawerComponent>
    </NavBarWrapper>
  );
}
