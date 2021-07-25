class LightSelect{

    constructor({element, isSearch = false, addititonalClass = ""}) {
        this.element = element;
        this.renderedElement = null;
        this.isSearch = isSearch;
        this.isModified = false;
        this.isOpened = false;
        this.defaultState = [];
        this.addititonalClass = addititonalClass;
        LightSelect.#init(this);
    }

    static #setHandlers(instance){

        const {renderedElement, element} = instance;
        const title = renderedElement.querySelector('.lightSelect__title');
        const list = renderedElement.querySelector('.lightSelect__list');

        // toggling dropdown visibility
        title.addEventListener('click', () => {
            if(instance.isOpened){
                LightSelect.hide(instance);
            } else {
                LightSelect.show(instance);
            }
        });

        // setting LightSelect value when list item was clicked
        list.addEventListener('click', e => {
            if(e.target.classList.contains('lightSelect__list-item')){
                LightSelect.setActiveOption(instance, +e.target.dataset.index);
                LightSelect.hide(instance);
            }
        });

        // setting LightSelect value when source <select> was changed
        element.addEventListener('change', () => {
            LightSelect.setActiveOption(instance, element.selectedIndex);
        });

        // handling search field input events
        if(instance.isSearch){
            const searchElem = renderedElement.querySelector('.lightSelect__search-control');

            searchElem.addEventListener('input', function () {
                if(instance.onSearchInput && typeof instance.onSearchInput === 'function'){
                    instance.onSearchInput()
                }
            });
        }

        // closing a dropdown if click event detected elsewhere but not on lightSelect DOM-elements
        window.addEventListener('click', (e) => {
            if(e.target.closest('.lightSelect') === instance.renderedElement){
                e.stopPropagation();
            } else {
                LightSelect.hide(instance);
            }
        });
    }

    static #init(instance){

        let {element, renderedElement, defaultState} = instance;

        element.querySelectorAll('option').forEach(option => {
            defaultState.push({
                text: option.textContent,
                value: option.value
            })
        })

        // storing an element to LightSelect instance
        element.style.display = 'none';

        // rendering and storing rendered element to LightSelect instance
        instance.renderedElement = LightSelect.#render(instance);
        instance.renderedElement.LightSelect = instance;

        // setting activeIndex to LightSelect DOM-element
        LightSelect.setActiveOption(instance, element.selectedIndex);

        // installation of handlers for basic functional elements
        LightSelect.#setHandlers(instance);
    }

    static #render({element, isSearch, addititonalClass}){
        const optionsCollection = element.querySelectorAll('option');

        // creating main wrapper
        const wrapperEl = document.createElement('div');
        wrapperEl.classList.add('lightSelect');
        wrapperEl.innerHTML = `
                <div class="lightSelect__title">
                    <div class="lightSelect__title-text"></div>
                    <div class="lightSelect__arrow">
                        <b class="lightSelect__arrow-item"></b>
                    </div>
                </div>
                <div class="lightSelect__dropdown">
                    <div class="lightSelect__preloader">
                        <div class="loadingio-spinner-rolling-qeyqj7cntg">
                            <div class="ldio-xalf9ctbgyn">
                                <div></div>
                            </div>
                        </div>
                    </div>
                    <div class="lightSelect__list"></div>
                </div>
            `;

        if(addititonalClass){
            wrapperEl.classList.add(addititonalClass)
        }

        // getting option elements from source <select> DOM-element
        // const optionsCollection = this.element.querySelectorAll('option');

        // getting dropdown element and list element from main wrapper which was created above
        const dropdownEl = wrapperEl.querySelector('.lightSelect__dropdown');
        const optionsListEl = dropdownEl.querySelector('.lightSelect__list');

        // appending option elements values to list items
        optionsCollection.forEach((option, index) => {
            optionsListEl.innerHTML += `
                    <div class="lightSelect__list-item" data-value="${option.value}" data-index="${index}">${option.textContent}</div>
                `;
        })

        // appending main wrapper after source <select> DOM-element
        element.after(wrapperEl);

        // appending search panel into dropdown element
        if(isSearch){
            wrapperEl.classList.add('lightSelect__search');

            const searchPanel = document.createElement('div');
            searchPanel.classList.add('lightSelect__search-panel');
            searchPanel.innerHTML = `<input class="lightSelect__search-control" type="text" placeholder="Поиск">`;

            dropdownEl.prepend(searchPanel);
        }

        return wrapperEl;
    }

    static setActiveOption(instance, index = 0){
        const {renderedElement, element} = instance;
        const title = renderedElement.querySelector('.lightSelect__title-text');
        const listElements = renderedElement.querySelectorAll('.lightSelect__list-item');
        let selectedElement = listElements[index];

        if(!selectedElement){
            console.error(`nonexistent item by index: ${index}`);
            index = 0;
            selectedElement = listElements[index];
        }

        // removing activity class from all LigthSelect list item
        listElements.forEach(element => {
            element.classList.remove('lightSelect__list-item--selected');
        });

        // add activity class to selected LightSelect list item and setting title text value/ index
        selectedElement.classList.add('lightSelect__list-item--selected');
        title.textContent = selectedElement.textContent;
        title.dataset['index'] = index;
        title.dataset['value'] = selectedElement.dataset['value'];

        // changing source <select> DOM-element state
        element.selectedIndex = index;

        instance.activeOptionData = {
            index,
            value: selectedElement.dataset['value'],
            text: selectedElement.textContent
        }

        if(instance.onChange && typeof instance.onChange === 'function'){
            instance.onChange();
        }
    }

    static appendItems(instance, itemsArr, activeIndex = 0){
        const {element, renderedElement } = instance;

        const list = renderedElement.querySelector('.lightSelect__list');

        itemsArr.forEach(({value, text}) => {
            let listLength = renderedElement.querySelectorAll('.lightSelect__list-item').length;

            list.innerHTML += `
                    <div class="lightSelect__list-item" data-value="${value}" data-index="${listLength}">${text}</div>
                `;

            element.innerHTML += `<option value="${value}">${text}</option>`
        })

        if(!itemsArr.length){
            list.innerHTML = `<div class="lightSelect__list-item">No options to show</div>`;
        }

        instance.isModified = true;

        if(activeIndex >= 0){
            LightSelect.setActiveOption(instance, activeIndex)
        }
    }

    static replaceItems(instance, itemsArr, activeIndex){
        LightSelect.deleteItems(instance);
        LightSelect.appendItems(instance, itemsArr, activeIndex);
    }

    static deleteItems({element, renderedElement, isModified}){
        element.innerHTML = "";
        renderedElement.querySelector('.lightSelect__list').innerHTML = "";
        isModified = true;
    }

    static show(instance){
        let {renderedElement, isSearch} = instance;
        instance.isOpened = true;
        renderedElement.classList.add('lightSelect--active');
        renderedElement.querySelector('.lightSelect__title').classList.add('lightSelect__title--active');
        renderedElement.querySelector('.lightSelect__dropdown').classList.add('lightSelect__dropdown--visible');

        if(instance.onOpen){
            instance.onOpen();
        }

        if(isSearch){
            renderedElement.querySelector('.lightSelect__search-control').focus();
        }
    }

    static hide(instance){
        let {renderedElement, isSearch, isModified, defaultState} = instance;
        instance.isOpened = false;
        renderedElement.classList.remove('lightSelect--active');
        renderedElement.querySelector('.lightSelect__title').classList.remove('lightSelect__title--active')
        renderedElement.querySelector('.lightSelect__dropdown').classList.remove('lightSelect__dropdown--visible');

        if(instance.onHide){
            instance.onHide();
        }

        if(isSearch){
            renderedElement.querySelector('.lightSelect__search-control').value = "";
        }
    }

    static destroy({element, renderedElement}){
        element.style = "";
        renderedElement.remove();
        delete element.LightSelect;
    }

    static preloaderShow(instance){
        const {renderedElement} = instance;
        const preloader = renderedElement.querySelector('.lightSelect__preloader');
        preloader.classList.add('lightSelect__preloader--active');
    }

    static preloaderRemove(instance){
        const {renderedElement} = instance;
        const preloader = renderedElement.querySelector('.lightSelect__preloader');
        preloader.classList.remove('lightSelect__preloader--active');
    }
}

function initLightSelect(elementSelector, options = {}) {
    const elementCollection = document.querySelectorAll(elementSelector);

    elementCollection.forEach(element => {
        new LightSelect({
            element: element,
            ...options
        });
    })
}

function getJSON(url, options = {}){
    return fetch(url).then(data => data.json())
}

function throttleLimiter(callback, timeout){
    let isLimited = false;

    return function () {
        if(!isLimited){
            isLimited = true;
            setTimeout(() => {
                callback();
                isLimited = false;
            }, timeout)
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {

    // initializing selects
    initLightSelect('.light-select-city', {
        isSearch: true,
        addititonalClass: 'lightSelect__city'
    });

    initLightSelect('.light-select-department', {
        isSearch: true,
        addititonalClass: 'lightSelect__department'
    });

    // getting lightselect DOM-elements
    const citySelect = document.querySelector('.lightSelect__city');
    const departmentSelect = document.querySelector('.lightSelect__department');

    // getting cities list
    const getCities = throttleLimiter(async function () {
        LightSelect.preloaderShow(citySelect.LightSelect);
        LightSelect.replaceItems(
            citySelect.LightSelect,
            await getJSON('https://zinger1988.github.io/fakeDB/regions.json')
                .then(({regions}) => regions.map(({id, name}) => ({ value: id, text: name }))),
            -1)
        LightSelect.preloaderRemove(citySelect.LightSelect);
    }, 1000)

    // getting post departments list
    const getDepartments = throttleLimiter(async function () {

        const departmentID = citySelect.LightSelect.renderedElement.querySelector('.lightSelect__title-text').dataset['value']


        LightSelect.preloaderShow(departmentSelect.LightSelect);
        LightSelect.replaceItems(
            departmentSelect.LightSelect,
            await getJSON('https://zinger1988.github.io/fakeDB/regions.json')
                .then(({regions}) => regions.map(({id, name}) => ({ value: id, text: name }))),
            0)
        LightSelect.preloaderRemove(departmentSelect.LightSelect);
    }, 1000)

    citySelect.LightSelect.onOpen = function () {
        const bodyElem = document.querySelector('body');
        bodyElem.classList.add('no-overflow','overlay');
    }

    citySelect.LightSelect.onHide = function () {
        const bodyElem = document.querySelector('body');
        bodyElem.classList.remove('no-overflow','overlay');

        if(this.isModified){
            LightSelect.replaceItems(this, this.defaultState, -1);
        }
    }

    citySelect.LightSelect.onChange = function () {
        getDepartments()
    }

    citySelect.LightSelect.onSearchInput = async function () {
        const searchFiled = this.renderedElement.querySelector('.lightSelect__search-control');

        if(searchFiled.value.length >= 3){
            await getCities();
        } else if(this.isModified){
            this.isModified = false;
            LightSelect.replaceItems(this, this.defaultState, -1)
        }
    }

});



