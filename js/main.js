"use strict";
window.addEventListener('DOMContentLoaded', function() {
   let keyCode;
   
   function mask(event) {
      event.keyCode && (keyCode = event.keyCode);

      let pos = this.selectionStart;

      if (pos < 3) event.preventDefault();

      let matrix = "+7 (___) ___-__-__";
         
      let i = 0;
      
      let def = matrix.replace(/\D/g, "");
      
      let val = this.value.replace(/\D/g, "");
      
      let new_value = matrix.replace(/[_\d]/g, function(a) {
         return i < val.length? val.charAt(i++) || def.charAt(i): a
      });

      i = new_value.indexOf("_");

      if (i != -1) {
         i < 5 && (i = 3);
         new_value = new_value.slice(0, i)
      }

      let reg = matrix.substr(0, this.value.length).replace(/_+/g,

      function(a) {
         return "\\d{1," + a.length + "}"
      }).replace(/[+()]/g, "\\$&");

      reg = new RegExp("^" + reg + "$");

      if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;

      if (event.type == 'blur' && this.value.length < 5) this.value = ""
   }

   let inputs = document.querySelectorAll(".phone");
   inputs.forEach(input => {
      input.addEventListener('input', mask, false);
      input.addEventListener('focus', mask, false);
      input.addEventListener('blur', mask, false);
      input.addEventListener('keydown', mask, false);
   });
});

let portfolioSwiper = document.querySelector('.portfolio__slider');
if (portfolioSwiper) {
   const swiper = new Swiper('.portfolio__slider', {
      speed: 600,
      simulateTouch: false,
      spaceBetween: 30,

      breakpoints: {
         0: {
            slidesPerView: 1,
         },
         480: {
            slidesPerView: 'auto',
         },
      },
      navigation: {
         nextEl: '.arrows__arrow-next-portfolio',
         prevEl: '.arrows__arrow-prev-portfolio',
      },
   });
}

let clientsSwiper = document.querySelector('.clients__slider');
if (clientsSwiper) {
   const swiper = new Swiper('.clients__slider', {
      speed: 600,
      simulateTouch: false,
      spaceBetween: 20,
      slidesPerView: 'auto',

      navigation: {
         nextEl: '.arrows__arrow-next-clients',
         prevEl: '.arrows__arrow-prev-clients',
      },
   });
}
const animItems = document.querySelectorAll('._anim-items');
if (animItems.length > 0) {
   window.addEventListener('scroll', animOnScroll);
   function animOnScroll() {
      for (let index = 0; index < animItems.length; index++){
         const animItem = animItems[index];
         const animItemHeight = animItem.offsetHeight;
         const animItemOffset = offset(animItem).top;
         const animStart = 4;

         let animItemPoint = window.innerHeight - animItemHeight / animStart;
         if (animItemHeight > window.innerHeight) {
            animItemPoint = window.innerHeight - window.innerHeight / animStart;
         }

         if ((pageYOffset > animItemOffset - animItemPoint) && pageYOffset < (animItemOffset + animItemHeight)) {
            animItem.classList.add('_active');
         } else {
            if (!animItem.classList.contains('_anim-no-hide')) {
               animItem.classList.remove('_active');
            }
         }
      }
   }
   function offset(el) {
      const rect = el.getBoundingClientRect(),
         scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
         scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
   }

   setTimeout(() => {
      animOnScroll();
   }, 300);
}
// МЕНЮ БУРГЕР
let menu = document.querySelector('.icon-menu');
let menuBody = document.querySelector('.menu__body');
menu.addEventListener('click', function () {
   document.body.classList.toggle('_lock');
   menu.classList.toggle('_active');
   menuBody.classList.toggle('_active');
});

/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
   const className = '_dynamic_adapt_'
   const attrName = 'data-da'

   /** @type {dNode[]} */
   const dNodes = getDNodes()

   /** @type {dMediaQuery[]} */
   const dMediaQueries = getDMediaQueries(dNodes)

   dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)

      mediaHandler()
   })

   function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]

      elements.forEach((element) => {
         const attr = element.getAttribute(attrName)
         const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())

         const to = document.querySelector(toSelector)

         if (to) {
            result.push({
               parent: element.parentElement,
               element,
               to,
               breakpoint: breakpoint ?? '767',
               order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
               index: -1,
            })
         }
      })

      return sortDNodes(result)
   }

   /**
    * @param {dNode} items
    * @returns {dMediaQuery[]}
    */
   function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]

      return uniqItems.map((item) => {
         const [query, breakpoint] = item.split(',')

         return { query, breakpoint }
      })
   }

   /**
    * @param {MediaQueryList} matchMedia
    * @param {dNodes} items
    */
   function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
         if (matchMedia.matches) {
         items.forEach((item) => {
            moveTo(item)
         })

         items.reverse()
         } else {
         items.forEach((item) => {
            if (item.element.classList.contains(className)) {
               moveBack(item)
            }
         })

         items.reverse()
         }
      }
   }

   /**
    * @param {dNode} dNode
    */
   function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)

      if (order === 'last' || order >= to.children.length) {
         to.append(element)

         return
      }

      if (order === 'first') {
         to.prepend(element)

         return
      }

      to.children[order].before(element)
   }

   /**
    * @param {dNode} dNode
    */
   function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)

      if (index >= 0 && parent.children[index]) {
         parent.children[index].before(element)
      } else {
         parent.append(element)
      }
   }

   /**
    * @param {HTMLElement} element
    * @param {HTMLElement} parent
    */
   function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
   }

   /**
    * Функция сортировки массива по breakpoint и order
    * по возрастанию для type = min
    * по убыванию для type = max
    *
    * @param {dNode[]} items
    */
   function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0

      return [...items].sort((a, b) => {
         if (a.breakpoint === b.breakpoint) {
         if (a.order === b.order) {
            return 0
         }

         if (a.order === 'first' || b.order === 'last') {
           return -1 * isMin
         }

         if (a.order === 'last' || b.order === 'first') {
           return 1 * isMin
         }

         return 0
      }

       return (a.breakpoint - b.breakpoint) * isMin
      })
   }

   function isNumber(value) {
      return !isNaN(value)
   }
}

useDynamicAdapt();
// ЛИПКИЙ HEADER
let header = document.querySelector('.header');
let mainBlock = document.querySelector('.main').clientHeight;
document.onscroll = function () {
   let scroll = window.scrollY;

   if (scroll + 100 > mainBlock) {
      header.classList.add('_g');
   } else {
      header.classList.remove('_g');
   }
   
   if (scroll + 50 > mainBlock) {
      header.classList.add('_r');
   } else {
      header.classList.remove('_r');
   }

   if (scroll > mainBlock) {
      header.classList.add('_fixed');
   } else {
      header.classList.remove('_fixed');
   }
}

// ТАБЫ
const tabs = document.querySelectorAll('[data-tabs]');
if (tabs.length > 0) {
   tabs.forEach((tabsBlock, index) => {
      tabsBlock.classList.add('_tab-init');
      tabsBlock.setAttribute('data-tabs-index', index);
      tabsBlock.addEventListener("click", setTabsAction);
      initTabs(tabsBlock);
   });

   // Получение слойлеров с медиа запросами
   let mdQueriesArray = dataMediaQueries(tabs, "tabs");
   if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach(mdQueriesItem => {
         // Событие
         mdQueriesItem.matchMedia.addEventListener("change", function () {
            setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
         });
         setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
   }
}
// Установка позиций заголовков
function setTitlePosition(tabsMediaArray, matchMedia) {
   tabsMediaArray.forEach(tabsMediaItem => {
      tabsMediaItem = tabsMediaItem.item;
      let tabsTitles = tabsMediaItem.querySelector('[data-tabs-titles]');
      let tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
      let tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
      let tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');
      tabsTitleItems = Array.from(tabsTitleItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
      tabsContentItems = Array.from(tabsContentItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
      tabsContentItems.forEach((tabsContentItem, index) => {
         if (matchMedia.matches) {
            tabsContent.append(tabsTitleItems[index]);
            tabsContent.append(tabsContentItem);
            tabsMediaItem.classList.add('_tab-spoller');
         } else {
            tabsTitles.append(tabsTitleItems[index]);
            tabsMediaItem.classList.remove('_tab-spoller');
         }
      });
   });
}
// Работа с контентом
function initTabs(tabsBlock) {
   let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-titles]>*');
   let tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
   const tabsBlockIndex = tabsBlock.dataset.tabsIndex;

   if (tabsContent.length) {
      tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsContent.forEach((tabsContentItem, index) => {
         tabsTitles[index].setAttribute('data-tabs-title', '');
         tabsContentItem.setAttribute('data-tabs-item', '');

         tabsContentItem.hidden = !tabsTitles[index].classList.contains('_tab-active');
      });
   }
}
function setTabsStatus(tabsBlock) {
   let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
   let tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
   const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
   function isTabsAnamate(tabsBlock) {
      if (tabsBlock.hasAttribute('data-tabs-animate')) {
         return tabsBlock.dataset.tabsAnimate > 0 ? Number(tabsBlock.dataset.tabsAnimate) : 500;
      }
   }
   const tabsBlockAnimate = isTabsAnamate(tabsBlock);
   if (tabsContent.length > 0) {
      tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsContent.forEach((tabsContentItem, index) => {
         if (tabsTitles[index].classList.contains('_tab-active')) {
            if (tabsBlockAnimate) {
               _slideDown(tabsContentItem, tabsBlockAnimate);
            } else {
               tabsContentItem.hidden = false;
            }
         } else {
            if (tabsBlockAnimate) {
               _slideUp(tabsContentItem, tabsBlockAnimate);
            } else {
               tabsContentItem.hidden = true;
            }
         }
      });
   }
}
function setTabsAction(e) {
   const el = e.target;
   if (el.closest('[data-tabs-title]')) {
      const tabTitle = el.closest('[data-tabs-title]');
      const tabsBlock = tabTitle.closest('[data-tabs]');
      if (!tabTitle.classList.contains('_tab-active') && !tabsBlock.querySelector('._slide')) {
         let tabActiveTitle = tabsBlock.querySelectorAll('[data-tabs-title]._tab-active');
         tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter(item => item.closest('[data-tabs]') === tabsBlock) : null;
         tabActiveTitle.length ? tabActiveTitle[0].classList.remove('_tab-active') : null;
         tabTitle.classList.add('_tab-active');
         setTabsStatus(tabsBlock);
      }
      e.preventDefault();
   }
}
// Обработа медиа запросов из атрибутов 
function dataMediaQueries(array, dataSetValue) {
	// Получение объектов с медиа запросами
	const media = Array.from(array).filter(function (item, index, self) {
		if (item.dataset[dataSetValue]) {
			return item.dataset[dataSetValue].split(",")[0];
		}
	});
	// Инициализация объектов с медиа запросами
	if (media.length) {
		const breakpointsArray = [];
		media.forEach(item => {
			const params = item.dataset[dataSetValue];
			const breakpoint = {};
			const paramsArray = params.split(",");
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});
		// Получаем уникальные брейкпоинты
		let mdQueries = breakpointsArray.map(function (item) {
			return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
		});
		mdQueries = uniqArray(mdQueries);
		const mdQueriesArray = [];

		if (mdQueries.length) {
			// Работаем с каждым брейкпоинтом
			mdQueries.forEach(breakpoint => {
				const paramsArray = breakpoint.split(",");
				const mediaBreakpoint = paramsArray[1];
				const mediaType = paramsArray[2];
				const matchMedia = window.matchMedia(paramsArray[0]);
				// Объекты с нужными условиями
				const itemsArray = breakpointsArray.filter(function (item) {
					if (item.value === mediaBreakpoint && item.type === mediaType) {
						return true;
					}
				});
				mdQueriesArray.push({
					itemsArray,
					matchMedia
				})
			});
			return mdQueriesArray;
		}
	}
}
// Уникализация массива
function uniqArray(array) {
	return array.filter(function (item, index, self) {
		return self.indexOf(item) === index;
	});
}
// Вспомогательные модули плавного расскрытия и закрытия объекта ===========================================
let _slideUp = (target, duration = 500) => { 
   if (!target.classList.contains('_slide')) {
      target.classList.add('_slide');
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = target.offsetHeight + 'px';
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(() => { 
         target.hidden = true;
         target.style.removeProperty('height');
         target.style.removeProperty('padding-top');
         target.style.removeProperty('padding-bottom');
         target.style.removeProperty('margin-top');
         target.style.removeProperty('margin-bottom');
         target.style.removeProperty('overflow');
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
      }, duration);
   }
}
let _slideDown = (target, duration = 500) => { 
   if (!target.classList.contains('_slide')) {
      target.classList.add('_slide');
      if (target.hidden) {
         target.hidden = false;
      }
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = height + 'px';
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      window.setTimeout(() => { 
         target.style.removeProperty('height');
         target.style.removeProperty('overflow');
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
      }, duration);
   }
}
let _slideToggle = (target, duration = 500) => { 
   if (target.hidden) {
      return _slideDown(target, duration);
   } else {
      return _slideUp(target, duration);
   }
}
// POPUP
const popupLinks = document.querySelectorAll('[data-popup]');
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll("[data-lp]");

let unlock = true;

const timeout = 800;

if (popupLinks.length > 0) {
   for (let index = 0; index < popupLinks.length; index++){
      const popupLink = popupLinks[index];
      popupLink.addEventListener("click", function (e) {
         const popupName = popupLink.dataset.popup;
         const curentPopup = document.getElementById(popupName);
         popupOpen(curentPopup);
         e.preventDefault();
      });
   }
}
const popupCloseIcon = document.querySelectorAll('[data-close]');
if (popupCloseIcon.length > 0) {
   for (let index = 0; index < popupCloseIcon.length; index++){
      const el = popupCloseIcon[index];
      el.addEventListener('click', function (e) {
         popupClose(el.closest('.popup'));
         e.preventDefault();
      });
   }
}

function popupOpen(curentPopup) {
   if (curentPopup && unlock) {
      const popupActive = document.querySelector('.popup._open');
      if (popupActive) {
         popupClose(popupActive, false);
      } else {
         bodyLock();
      }
      curentPopup.classList.add('_open');
      curentPopup.addEventListener("click", function (e) {
         if (!e.target.closest('.popup__content')) {
            popupClose(e.target.closest('.popup'));
         }
      });
   }
}
function popupClose(popupActive, doUnlock = true) {
   if (unlock) {
      popupActive.classList.remove('_open');
      if (doUnlock) {
         bodyUnLock();
      }
   }
}

function bodyLock() {
   const lockPaddingValue = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';

   if (lockPadding.length > 0) {

      for (let index = 0; index < lockPadding.length; index++) {
         const el = lockPadding[index];

         el.style.paddingRight = lockPaddingValue;
      }
   }   
   body.style.paddingRight = lockPaddingValue;
   body.classList.add('_lock');

   unlock = false;
   setTimeout(function () {
      unlock = true;
   }, timeout);
}

function bodyUnLock() {
   setTimeout(function () {
      if (lockPadding.length > 0) {
         for (let index = 0; index < lockPadding.length; index++) {
            const el = lockPadding[index];
            el.style.paddingRight = '0px';
         }
      }   
      body.style.paddingRight = '0px';
      if (!(menuBody.classList.contains('_active'))) {
         body.classList.remove('_lock');
      }

   }, timeout);

   unlock = false;
   setTimeout(function () {
      unlock = true;
   }, timeout);
}

document.addEventListener('keydown', function (e) {
   if (e.which === 27) {
      const popupActive = document.querySelector('.popup._open');
      popupClose(popupActive);
   }
});

(function () {
   // проверяем поддержку
   if (!Element.prototype.closest) {
      // реализуем
      Element.prototype.closest = function (css) {
         var node = this;
         while (node) {
            if (node.matches(css)) return node;
            else node = node.parentElement;
         }
         return null;
      }
   }
})();
(function () {
   // проверяем поддержку
   if (!Element.prototype.matches) {
      // определяем свойство
      Element.prototype.matches = Element.prototype.matchesSelector ||
         Element.prototype.webkitMatchesSelector ||
         Element.prototype.mozMatchesSelector ||
         Element.prototype.msMatchesSelector;
   }
})();
// ВАЛИДАЦИЯ ФОРМЫ
let forms = document.querySelectorAll('form');
if (forms.length > 0) { 
   intitForms(forms);
}
function intitForms(forms) {
   for (let i = 0; i < forms.length; i++){
      initForm(forms[i]);
   }

   function initForm(form) { 
      form.addEventListener('submit', formSend);
      let error = formValidate(form);
      let phone = form.querySelector('.phone');
      let name = form.querySelector('.name');
      let resultMessage = document.createElement('div');
      let resultPhone, resultName;
      let btn = form.querySelector('.btn');

      async function formSend(e) {
         e.preventDefault();

         // для отправки спомощью AJAX
         const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
         const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
         const formData = new FormData(form);

         if (true) {
            form.reset();
            resultMessage.classList.add('_goodmessage');
            form.appendChild(resultMessage);
            resultMessage.textContent = 'Отправленно'; 
            phone.disabled = true;
            name.disabled = true;
            btn.disabled = true;
            resultPhone = false;
            resultName = false;
            setTimeout(() => {
               phone.disabled = false;
               name.disabled = false;
               resultMessage.remove();
            }, 5000);
         }
      }

      function formValidate(form) { 
         let phone = form.querySelector('.phone');
         let name = form.querySelector('.name');
         let phoneMessage = document.createElement('div');
         let nameMessage = document.createElement('div');
         let phoneError, nameError, res;

         phone.addEventListener('input', function () {
            if ((!(phone.value === '')) && phone.value.match(/[^+]\d/i) && phone.value.length >= 18) {
               resultPhone = true;
            } else {
               resultPhone = false;
               btn.disabled = true;
            }
            if (resultPhone && resultName) {
               btn.disabled = false;
            } else {
               btn.disabled = true;
            }
         });
         name.addEventListener('input', function () {
            if (!(name.value === '')) { 
               resultName = true;
            }
            else {
               resultName = false;
               btn.disabled = true;
            }
            if (resultPhone && resultName) {
               btn.disabled = false;
            } else {
               btn.disabled = true;
            }
         });
         phone.addEventListener('blur', function () {
            if (phone.value === '' || phone.value === '+7 ') {
               formAddError(phone);
               phone.parentElement.appendChild(phoneMessage);
               phoneMessage.classList.add('_errormessage');
               phoneError = phone.parentElement.querySelector('._errormessage');
               phoneMessage.textContent = 'Номер не корректный';
               resultPhone = false;
            }
         });
         name.addEventListener('blur', function () {
            if (name.value === '') {
               formAddError(name);
               name.parentElement.appendChild(nameMessage);
               nameMessage.classList.add('_errormessage');
               nameError = name.parentElement.querySelector('._errormessage');
               nameMessage.textContent = 'Введите имя';
               resultName = false;
            }
         });
         phone.addEventListener('focus', function () {
            if (phoneError) {
               formRemoveError(phone);
               phoneError.remove();
            }
         });
         name.addEventListener('focus', function () {
            if (nameError) {
               formRemoveError(name);
               nameError.remove();
            }
         });
      }
      // Функция для добавления класса error
      function formAddError(input) { 
         input.parentElement.classList.add('_error');
         input.classList.add('_error');
      }
      // Функция для удаления класса error
      function formRemoveError(input) { 
         input.parentElement.classList.remove('_error');
         input.classList.remove('_error');
      }
   }
}
// ЯКОРЬ (ПЛАВНАЯ ПРОКРУТКА ДО НУЖНОГО БЛОКА) С ПОДСВЕТКОЙ АКТИВНОГО ПУНКТА МЕНЮ
let menuLinks = document.querySelectorAll('[data-goto]');
if (menuLinks.length > 0) {
   let gotoBlock, gotoBlockValue, gotoBlockHeight, scrollDistance;
   window.addEventListener('scroll', menuLinkActive);
   for (let menuLink of menuLinks) {
      menuLink.addEventListener('click', onMenuLinkClick);
   }
   function menuLinkVars(menuLink) {
      scrollDistance = pageYOffset;
      gotoBlock = document.querySelector(menuLink.dataset.goto);
      gotoBlockHeight = document.querySelector(menuLink.dataset.goto).offsetHeight;
      gotoBlockValue = gotoBlock.getBoundingClientRect().top + scrollDistance - document.querySelector('header').offsetHeight;
   }
   function onMenuLinkClick(e) {
      let menuLink = e.target;
      if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
         menuLinkVars(menuLink);
         if (menu.classList.contains('_active')) {
            document.body.classList.remove('_lock');
            menu.classList.remove('_active');
            menuBody.classList.remove('_active');
         }
         
         window.scrollTo({
            top: gotoBlockValue,
            behavior: 'smooth'
         });
         e.preventDefault();
      }
   }
   function menuLinkActive(e) { 
      for (let menuLink of menuLinks) { 
         if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) { 
            menuLinkVars(menuLink);
            if (gotoBlock.offsetTop - document.querySelector('header').offsetHeight <= scrollDistance + 1 && gotoBlockHeight + gotoBlockValue > scrollDistance) {
                  for (let menuLink of menuLinks) {
                     if (menuLink.classList.contains('_active')) {
                        menuLink.classList.remove('_active');
                     }
                  }
               menuLink.classList.add('_active');
            } else {
               menuLink.classList.remove('_active');
            }
         }
      }
   }
}