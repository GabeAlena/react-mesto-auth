import { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupwithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Register from './Register';
import Login from './Login';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import * as auth from '../utils/auth.js';
import successImage from '../images/success.svg';
import failImage from '../images/fail.svg';

function App() {
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState({isOpen : false});
    const [cards, setCards] = useState([]);
    const [currentUser, setCurrentUser] = useState({});
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [infoTooltip, setInfoTooltip] = useState(false);
    const [infoTooltipImage, setInfoTooltipImage] = useState('');
    const [infoTooltilMessage, setInfoTooltipMessage] = useState('');

    function handleRegister({email, password}) {
      auth.register(email, password)
          .then((response) => {
            setUserEmail(response.data.email);
            console.log(email);
            setInfoTooltipImage(successImage);
            setInfoTooltipMessage("Вы успешно зарегистрировались!");
            if (response) {
              navigate('/sign-in');
              return response.json;
            }
          })
          .catch((err) => {
            console.log(err);
            setInfoTooltipImage(failImage);
            setInfoTooltipMessage("Что-то пошло не так! Попробуйте ещё раз.");
          })
          .finally(handleInfoTooltip);
    }

    function handleLogin({email, password}) {
      auth.login(email, password)
          .then((response) => {
            console.log(response);
            localStorage.setItem('jwt', response.token);
            setIsLoggedIn(true);
            setUserEmail(email);
            navigate('/');             
          })
          .catch((err) => {
            setInfoTooltipImage(failImage);
            setInfoTooltipMessage("Что-то пошло не так! Попробуйте ещё раз.");
            console.log(err);
          })
          .finally(handleInfoTooltip);
    }

    const checkToken = () => {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        auth.checkToken(jwt)
            .then((response) => {
                setUserEmail(response.email);
                setIsLoggedIn(true);
                navigate('/');        
            })
            .catch((err) => {
              console.log(err);
            })
      }
    }

    function handleInfoTooltip(){
      setInfoTooltip(true);
    }

    const handleSignOut = () => {
      localStorage.removeItem('jwt');
      setIsLoggedIn(false);
      navigate('/sign-in');
    }

    useEffect(() => {
      if (isLoggedIn)
        Promise.all([api.getUserInfo(), api.getInitialCards()])
          .then(([userInfo, cardsList]) => {
            setCurrentUser(userInfo);
            setCards(cardsList);
          })
          .catch((err) => {
              console.log(err);
          });
    }, [isLoggedIn])
    
    useEffect(() => {
        checkToken();
    }, [])

    function handleCardClick(card) {
        card.isOpen = true;
        setSelectedCard(card)
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some(i => i._id === currentUser._id);
        
        api.changeLikeCardStatus(card._id, !isLiked)
          .then((newCard) => {
            setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
          })
          .catch((err) => {
              console.log(err);
          });
    }

    function handleCardDelete(card) {
        api.deleteCard(card._id)
          .then(() => {
              setCards((state) => cards.filter((c) => c._id !== card._id));
          })
          .catch((err) => {
              console.log(err);
          });
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    }

    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function closeAllPopups() {
        setIsEditAvatarPopupOpen(false);
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setSelectedCard({isOpen : false});
        setInfoTooltip(false);
    }

    function handleUpdateUser({ name, about }) {
        api.editProfileData(name, about)
          .then((newProfileData) => {
            setCurrentUser(newProfileData);
          })
          .catch((err) => {
              console.log(err);
          })
          .finally(() => {
            closeAllPopups();
          })
    }

    function handleUpdateAvatar({ avatar }) {
        api.patchAvatar(avatar)
          .then((newAvatar) => {
            setCurrentUser(newAvatar);
          })
          .catch((err) => {
              console.log(err);
          })
          .finally(() => {
            closeAllPopups();
          })
    }

    function handleAddPlaceSubmit({ name, link }) {
        api.postNewCard(name, link)
          .then((newCard) => {
            setCards([newCard, ...cards]);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            closeAllPopups();
          })
    }

    return (
      <CurrentUserContext.Provider value={currentUser}>
          <Header email={userEmail} isLoggedIn={isLoggedIn} handleSignOut={handleSignOut} />

          <Routes>
              <Route path="/sign-up" element={
                  <Register onRegister={handleRegister} />
              }/>

              <Route path="/sign-in" element={
                  <Login onLogin={handleLogin} />
              }/>

              <Route path="/" exact element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <Main
                          onEditAvatar={handleEditAvatarClick} 
                          onEditProfile={handleEditProfileClick} 
                          onAddPlace={handleAddPlaceClick} 
                          cards={cards}
                          onCardClick={handleCardClick}
                          onCardLike={handleCardLike}
                          onCardDelete={handleCardDelete}
                      />
                      <Footer />
                  </ProtectedRoute>
              }/>

          </Routes>

          <EditAvatarPopup 
              isOpen={isEditAvatarPopupOpen} 
              onClose={closeAllPopups} 
              onUpdateAvatar={handleUpdateAvatar} 
          />
          
          <EditProfilePopup 
              isOpen={isEditProfilePopupOpen} 
              onClose={closeAllPopups} 
              onUpdateUser={handleUpdateUser} 
          />

          <AddPlacePopup 
              isOpen={isAddPlacePopupOpen} 
              onClose={closeAllPopups} 
              onAddPlace={handleAddPlaceSubmit}           
          />

          <ImagePopup 
              card={selectedCard} 
              onClose={closeAllPopups}
          />

          <PopupWithForm 
              name="delete-card" 
              title="Вы уверены?" 
              textButton="Да"
          />

          <InfoTooltip 
              isOpen={infoTooltip}
              image={infoTooltipImage}
              message={infoTooltilMessage}
              onClose={closeAllPopups}
          />
      </CurrentUserContext.Provider>
    );
}    

export default App;