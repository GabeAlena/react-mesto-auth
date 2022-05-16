import React from 'react';
import { api } from '../utils/api.js';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupwithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState({isOpen : false});
    const [cards, setCards] = React.useState([]);

    const [currentUser, setCurrentUser] = React.useState({});

    React.useEffect(() => {
        Promise.all([api.getUserInfo(), api.getInitialCards()])
          .then(([userInfo, cardsList]) => {
            setCurrentUser(userInfo);
            setCards(cardsList);
          })
          .catch((err) => {
              console.log(err);
          })
    }, []);
        
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
          <Header />
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
      </CurrentUserContext.Provider>
    );
}    

export default App;