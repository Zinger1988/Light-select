class LightSelect{

    constructor({element, isSearch = false, disabled = false}) {
        this.source = {
            _select: element,
            _options: null,
        };
        this.rendered = {
            _container: null,
            _title: null,
            _titleText: null,
            _searchControl: null,
            _list: null,
            _listItems: null,
            _dropdown: null
        };
        this.state = {
            search: isSearch,
            disabled: disabled,
            _isOpened: false,
            _isModified: false,
            _activeElemData: {},
            defaultState: [],
        };
        LightSelect.#init(this);
    }

    static #setHandlers(instance){

        const {source: {_select}, rendered: {_container, _title, _list, _searchControl}, state: {search}} = instance;

        // toggling dropdown visibility
        _title.addEventListener('click', () => {
            if(instance.state._isOpened){
                LightSelect.hide(instance);
            } else {
                LightSelect.show(instance);
            }
        });

        // setting LightSelect value when list item was clicked
        _list.addEventListener('click', e => {
            if(e.target.classList.contains('lightSelect__list-item') && e.target.dataset.disabled !== 'true'){
                LightSelect.setActiveOption(instance, +e.target.dataset.index);
                LightSelect.hide(instance);
            }
        });

        // setting LightSelect value when source <select> was changed
        _select.addEventListener('change', () => {
            LightSelect.setActiveOption(instance, _select.selectedIndex);
        });

        // handling search field input events
        if(search){
            _searchControl.addEventListener('input', function () {
                if(instance.onSearchInput && typeof instance.onSearchInput === 'function'){
                    instance.onSearchInput()
                }
            });
        }

        // closing a dropdown if click event detected elsewhere but not on lightSelect DOM-elements
        window.addEventListener('click', (e) => {
            console.log(e.target);
            if(e.target.closest('.lightSelect') === _container){
                e.stopPropagation();
            } else {
                LightSelect.hide(instance);
            }
        });
    }

    static #init(instance){

        let {source: {_select}, state: {defaultState}} = instance;

        _select.querySelectorAll('option').forEach((option, i) => {
            defaultState.push({
                text: option.textContent,
                value: option.value,
                disabled: option.disabled,
                index: i,
            })
        })

        // storing an element to LightSelect instance
        _select.style.display = 'none';

        // rendering and storing rendered element to LightSelect instance
        LightSelect.#render(instance);
        _select.LightSelect = instance;

        // setting activeIndex to LightSelect DOM-element
        LightSelect.setActiveOption(instance, _select.selectedIndex);

        // installation of handlers for basic functional elements
        LightSelect.#setHandlers(instance);
    }

    static disable(instance){
        let {state, rendered, source} = instance;
        state.disabled = true;
        rendered._container.classList.add('lightSelect--disabled');
        source._select.disabled = true;
    }

    static enable(instance){
        let {state, rendered, source} = instance;
        state.disabled = false;
        rendered._container.classList.remove('lightSelect--disabled');
        source._select.disabled = false;
    }

    static #render(instance){
        const {source: {_select}, state: {search}} = instance;
        let {source, rendered, state} = instance

        // creating main wrapper
        rendered._container = document.createElement('div');
        rendered._container.classList.add('lightSelect');
        rendered._container.innerHTML = `
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

        if(state.disabled || _select.disabled){
            LightSelect.disable(instance)
        }

        source._options = _select.querySelectorAll('option');
        rendered._title = rendered._container.querySelector('.lightSelect__title');
        rendered._titleText = rendered._container.querySelector('.lightSelect__title-text');
        rendered._list = rendered._container.querySelector('.lightSelect__list');
        rendered._dropdown = rendered._container.querySelector('.lightSelect__dropdown');

        // appending option elements values to list items
        source._options.forEach((option, index) => {
            rendered._list.innerHTML += `
                    <div class="lightSelect__list-item" data-disabled="${option.disabled}" data-value="${option.value}" data-index="${index}">${option.textContent}</div>
                `;
        })

        // appending main wrapper after source <select> DOM-element
        _select.after(rendered._container);

        // appending search panel into dropdown element
        if(search){
            rendered._container.classList.add('lightSelect__search');

            const searchPanel = document.createElement('div');
            searchPanel.classList.add('lightSelect__search-panel');
            searchPanel.innerHTML = `<input class="lightSelect__search-control" type="text" placeholder="Поиск">`;
            rendered._dropdown.prepend(searchPanel);

            rendered._searchControl = searchPanel.querySelector('.lightSelect__search-control');
        }
    }

    static setActiveOption(instance, index = 0){
        const {source: {_select}, rendered: {_titleText, _list}} = instance;

        instance.rendered._listItems = _list.querySelectorAll('.lightSelect__list-item');

        let selectedElement = instance.rendered._listItems[index];

        if(!selectedElement){
            console.error(`nonexistent item by index: ${index}`);
            index = 0;
            selectedElement = instance.rendered._listItems[index];
        }

        // removing activity class from all LigthSelect list item
        instance.rendered._listItems.forEach(element => {
            element.classList.remove('lightSelect__list-item--selected');
        });

        // add activity class to selected LightSelect list item and setting title text value/ index
        selectedElement.classList.add('lightSelect__list-item--selected');
        _titleText.textContent = selectedElement.textContent;
        _titleText.dataset['index'] = index;
        _titleText.dataset['value'] = selectedElement.dataset['value'];

        // changing source <select> DOM-element state
        _select.selectedIndex = index;

        instance.state._activeElemData = {
            index,
            value: selectedElement.dataset['value'],
            text: selectedElement.textContent
        }

        if(instance.onChange && typeof instance.onChange === 'function'){
            instance.onChange();
        }
    }

    static appendItems(instance, itemsArr, activeIndex = 0){
        const {source: {_select}, rendered: {_list} } = instance;

        itemsArr.forEach(({value, text, disabled}) => {
            let listLength = _list.querySelectorAll('.lightSelect__list-item').length;
            _list.innerHTML += `<div class="lightSelect__list-item" data-disabled="${disabled}" data-value="${value}" data-index="${listLength}">${text}</div>`;

            const option = document.createElement("option");
            option.disabled = !!disabled;
            option.value = value;
            option.textContent = text;
            _select.append(option);
        })

        if(!itemsArr.length){
            _list.innerHTML = `<div class="lightSelect__list-item">No options to show</div>`;
        }

        instance.state._isModified = true;

        if(activeIndex >= 0){
            LightSelect.setActiveOption(instance, activeIndex)
        }
    }

    static replaceItems(instance, itemsArr, activeIndex){ // --------------------------------------------
        LightSelect.deleteItems(instance);
        LightSelect.appendItems(instance, itemsArr, activeIndex);
    }

    static deleteItems(instance){
        const {source: {_select}, rendered: {_container, _list}} = instance;
        _select.innerHTML = "";
        _list.innerHTML = "";
        instance.state._isModified = true;
    }

    static show(instance){
        const {rendered: {_container, _title, _dropdown, _searchControl}, state: {search}} = instance;
        let { state } = instance;


        if(state.disabled || state._isOpened) return

        state._isOpened = true;
        _container.classList.add('lightSelect--active');
        _title.classList.add('lightSelect__title--active');
        _dropdown.classList.add('lightSelect__dropdown--visible');

        if(instance.onOpen && typeof instance.onOpen === 'function'){
            instance.onOpen();
        }

        if(search){
            _searchControl.focus();
        }
    }

    static hide(instance){
        const {rendered: {_container, _title, _dropdown, _searchControl}, state: {search}} = instance;
        let { state } = instance;


        if(state.disabled || !state._isOpened) return

        state._isOpened = false;
        _container.classList.remove('lightSelect--active');
        _title.classList.remove('lightSelect__title--active')
        _dropdown.classList.remove('lightSelect__dropdown--visible');

        if(instance.onHide && typeof instance.onHide === 'function'){
            instance.onHide();
        }

        if(search){
            _searchControl.value = "";
        }
    }

    static destroy(instance){
        const {source: {_select}, rendered: {_container}} = instance;
        _select.style = "";
        _container.remove();
        delete _select.LightSelect;
    }

    static preloaderShow(instance){
        const {rendered: {_container}} = instance;
        const preloader = _container.querySelector('.lightSelect__preloader');
        preloader.classList.add('lightSelect__preloader--active');
    }

    static preloaderRemove(instance){
        const {rendered: {_container}} = instance;
        const preloader = _container.querySelector('.lightSelect__preloader');
        preloader.classList.remove('lightSelect__preloader--active');
    }

    static reset(instance){
        const {source: {_select}, rendered: {_list}, state: {defaultState} } = instance;

        _list.innerHTML = "";
        _select.innerHTML = "";

        defaultState.forEach(({value, text, disabled, index}) => {
            _list.innerHTML += `<div class="lightSelect__list-item" data-disabled="${disabled}" data-value="${value}" data-index="${index}">${text}</div>`;

            const option = document.createElement("option");
            option.disabled = !!disabled;
            option.value = value;
            option.textContent = text;
            _select.append(option);
        })

        LightSelect.setActiveOption(instance, 0);
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
    return fetch(url, options)
        .then(data => {
            if(data.ok && data.status === 200){
                return data.json()
            } else {
                throw new Error(`Unable to fetch url: ${url}`);
            }
        })
}

function throttleLimiter(timeout){
    let isLimited = false;

    return function (callback) {
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

    const setThrottle = throttleLimiter(1000);

    // initializing selects
    initLightSelect('.light-select-city', {
        isSearch: true,
    });

    initLightSelect('.light-select-department', {
        isSearch: true,
    });

    // getting lightselect DOM-elements
    const citySelect = document.querySelector('.light-select-city');
    const departmentSelect = document.querySelector('.light-select-department');

    const getData = async function({instance, url, bodyParams}){
        try {
            const formData = new FormData();

            formData.append('name', instance.rendered._searchControl.value);
            bodyParams.forEach(param => formData.append(param.name, param.value));

            LightSelect.preloaderShow(instance);
            LightSelect.replaceItems(
                instance,
                // await getJSON('url',
                //     {
                //         headers: {
                //             "Content-Type": "multipart/form-data"
                //         },
                //         method: "POST",
                //         body: formData
                //     })
                await getJSON(url)
                    .then(data => {
                        return data.map(({id, name}) => ({ value: id, text: name }))
                    }),
                -1)
        } catch (e) {
            console.error(e.message)
        } finally {
            LightSelect.preloaderRemove(instance);
        }
    }

    citySelect.LightSelect.onOpen = function () {
        const bodyElem = document.querySelector('body');
        bodyElem.classList.add('no-overflow','overlay');
    }

    citySelect.LightSelect.onHide = function () {
        const bodyElem = document.querySelector('body');
        bodyElem.classList.remove('no-overflow','overlay');

        const activeElemData = this.state._activeElemData;

        if(this.state._isModified){

            LightSelect.replaceItems(this, this.state.defaultState, -1);

            const matchingElem = this.state.defaultState.find(element => element.value === activeElemData.value);

            if(!matchingElem){
                LightSelect.appendItems(this, [activeElemData], this.state.defaultState.length)
            } else {
                LightSelect.setActiveOption(this, matchingElem.index);
            }
        }
    }

    citySelect.LightSelect.onChange = function () {
        LightSelect.enable(departmentSelect.LightSelect);

        if(departmentSelect.LightSelect.state._isModified){
            LightSelect.replaceItems(departmentSelect.LightSelect, departmentSelect.LightSelect.state.defaultState, 0);
        }
    }

    citySelect.LightSelect.onSearchInput = async function () {
        if(this.rendered._searchControl.value.length >= 3){

            await setThrottle(getData.bind(null, {
                instance: this,
                url: 'https://zinger1988.github.io/fakeDB/regions.json',
                bodyParams: [
                    {name: 'carrier_id', value: 2}
                ]
            }));

        } else if(this.state._isModified){
            this.state._isModified = false;
            LightSelect.replaceItems(this, this.state.defaultState, -1)
        }
    }

    departmentSelect.LightSelect.onSearchInput = async function () {
        if(this.rendered._searchControl.value.length >= 3){

            await setThrottle(getData.bind(null, {
                instance: this,
                url: 'https://zinger1988.github.io/fakeDB/departments.json',
                bodyParams: [
                    {name: 'carrier_id', value: 2},
                    {name: 'region_id', value: citySelect.LightSelect.state._activeElemData.value}
                ]
            }));

        } else if(this.state._isModified){
            this.state._isModified = false;

            LightSelect.replaceItems(this, this.state.defaultState, -1)
        }
    }

    departmentSelect.LightSelect.onHide = function () {

        const activeElemData = this.state._activeElemData;

        if(this.state._isModified){

            LightSelect.replaceItems(this, this.state.defaultState, -1);

            const isElemAlreadyExists = this.state.defaultState.find(element => element.value === activeElemData.value);
            if(!isElemAlreadyExists){
                LightSelect.appendItems(this, [activeElemData], this.state.defaultState.length)
            } else {
                LightSelect.setActiveOption(this, activeElemData.index);
            }
        }
    }

});



