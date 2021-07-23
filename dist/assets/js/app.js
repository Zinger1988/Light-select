class LightSelect{

    static setHandlers(instance){

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

        // method which will be handle search input event by callback
        if(instance.isSearch){
            instance.onSearchInput = function(callback) {
                if(typeof callback === 'function'){
                    const searchElem = renderedElement.querySelector('.lightSelect__search-control');
                    searchElem.addEventListener('input', callback);
                }
                // here can be search input callback bu default if callback was not provided
            }
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

    constructor({element, isSearch = false}) {
        this.element = element;
        this.renderedElement = {};
        this.isSearch = isSearch;
        this.isOpened = false;
        LightSelect.init(this);
    }

    static init(instance){

        let {element, renderedElement} = instance;

        // storing an element to LightSelect instance
        element.style.display = 'none';

        // rendering and storing rendered element to LightSelect instance
        instance.renderedElement = LightSelect.render(instance);
        instance.renderedElement.LightSelect = instance;

        // setting activeIndex to LightSelect DOM-element
        LightSelect.setActiveOption(instance, element.selectedIndex);

        // installation of handlers for basic functional elements
        LightSelect.setHandlers(instance);
    }

    static render({element, isSearch}){
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
                    <div class="lightSelect__list"></div>
                </div>
            `;

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

        // add activity class to selected LightSelect list item and setting title text value
        selectedElement.classList.add('lightSelect__list-item--selected');
        title.textContent = selectedElement.textContent;

        // changing source <select> DOM-element state
        element.selectedIndex = index;
    }

    static appendItems(instance, itemsArr, activeIndex = 0){
        const {element, renderedElement} = instance;

        const list = renderedElement.querySelector('.lightSelect__list');

        itemsArr.forEach(({value, text}) => {
            let listLength = renderedElement.querySelectorAll('.lightSelect__list-item').length;

            list.innerHTML += `
                    <div class="lightSelect__list-item" data-value="${value}" data-index="${listLength}">${text}</div>
                `;

            element.innerHTML += `<option value="${value}">${text}</option>`
        })

        if(activeIndex >= 0){
            LightSelect.setActiveOption(instance, activeIndex)
        }
    }

    static replaceItems(instance, itemsArr, activeIndex){
        LightSelect.deleteItems(instance);
        LightSelect.appendItems(instance, itemsArr, activeIndex);
    }

    static deleteItems({element, renderedElement}){
        element.innerHTML = "";
        renderedElement.querySelector('.lightSelect__list').innerHTML = "";
    }

    static show(instance){
        let {renderedElement, isSearch} = instance;
        instance.isOpened = true;
        renderedElement.classList.add('lightSelect--active');
        renderedElement.querySelector('.lightSelect__title').classList.add('lightSelect__title--active');
        renderedElement.querySelector('.lightSelect__dropdown').classList.add('lightSelect__dropdown--visible');

        if(isSearch){
            renderedElement.querySelector('.lightSelect__search-control').focus();
        }
    }

    static hide(instance){
        let {renderedElement, isSearch} = instance;
        instance.isOpened = false;
        renderedElement.classList.remove('lightSelect--active');
        renderedElement.querySelector('.lightSelect__title').classList.remove('lightSelect__title--active')
        renderedElement.querySelector('.lightSelect__dropdown').classList.remove('lightSelect__dropdown--visible');

        if(isSearch){
            renderedElement.querySelector('.lightSelect__search-control').value = "";
        }
    }

    static destroy({element, renderedElement}){
        element.style = "";
        renderedElement.remove();
        delete element.LightSelect;
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

document.addEventListener("DOMContentLoaded", function () {

    initLightSelect('.light-select');
    initLightSelect('.light-select-search', {
        isSearch: true,
    });


});

const arr = [
    {
        value: "blah1",
        text: "blah1"
    },
    {
        value: "blah2",
        text: "blah2"
    },
    {
        value: "blah3",
        text: "blah4"
    },
    {
        value: "blah4",
        text: "blah5"
    },
]



