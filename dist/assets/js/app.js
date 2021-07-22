document.addEventListener("DOMContentLoaded", function () {

    class LightSelect{

        static setHandlers(instance){

            const {renderedElement, element} = instance;
            const title = renderedElement.querySelector('.lightSelect__title');
            const list = renderedElement.querySelector('.lightSelect__list');

            // toggling dropdown visibility
            title.addEventListener('click', () => {
                if(instance.isOpened){
                    instance.hide();
                } else {
                    instance.show();
                }
            });

            // setting LightSelect value when list item was clicked
            list.addEventListener('click', e => {
                if(e.target.classList.contains('lightSelect__list-item')){
                    instance.setActiveOption(+e.target.dataset.index);
                    instance.hide();
                }
            });

            // setting LightSelect value when source <select> was changed
            element.addEventListener('change', () => {
                instance.setActiveOption(element.selectedIndex);
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
            window.addEventListener('click', () => instance.hide());
            renderedElement.addEventListener('click', (e) => e.stopPropagation());
        }

        constructor({selector, isSearch = false}) {
            this.element = null;
            this.renderedElement = null;
            this.isSearch = isSearch;
            this.isOpened = false;
            this.init(selector);
        }

        init(selector){
            const selectEls = document.querySelectorAll(selector);

            selectEls.forEach(element => {

                // storing an element to LightSelect instance
                this.element = element;
                this.element.style.display = 'none';

                // rendering and storing rendered element to LightSelect instance
                this.renderedElement = this.render();
                this.renderedElement.LightSelect = this;

                // setting activeIndex to LightSelect DOM-element
                this.setActiveOption(this.element.selectedIndex);

                // installation of handlers for basic functional elements
                LightSelect.setHandlers(this);
            });
        }

        render(){

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
            const optionsCollection = this.element.querySelectorAll('option');

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
            this.element.after(wrapperEl);

            // appending search panel into dropdown element
            if(this.isSearch){
                const searchPanel = document.createElement('div');
                searchPanel.classList.add('lightSelect__search-panel');
                searchPanel.innerHTML = `<input class="lightSelect__search-control" type="text" placeholder="Поиск">`;

                dropdownEl.prepend(searchPanel);
            }

            return wrapperEl;
        }

        setActiveOption(index){
            const title = this.renderedElement.querySelector('.lightSelect__title-text');
            const listElements = this.renderedElement.querySelectorAll('.lightSelect__list-item');
            const selectedElement = listElements[index];

            // removing activity class from all LigthSelect list item
            listElements.forEach(element => {
                element.classList.remove('lightSelect__list-item--selected');
            });

            // add activity class to selected LightSelect list item and setting title text value
            selectedElement.classList.add('lightSelect__list-item--selected');
            title.textContent = selectedElement.textContent;

            // changing source <select> DOM-element state
            this.element.selectedIndex = index;
        }

        update(updateArr){
            const list = this.renderedElement.querySelector('.lightSelect__list');

            updateArr.forEach(({value, text}) => {
                let listLength = this.renderedElement.querySelectorAll('.lightSelect__list-item').length;

                list.innerHTML += `
                    <div class="lightSelect__list-item" data-selected="false" data-value="${value}" data-index="${listLength}">${text}</div>
                `;

                this.element.innerHTML += `<option value="${value}">${text}</option>`
            })
        }

        show(){
            this.renderedElement.querySelector('.lightSelect__title').classList.add('lightSelect__title--active')
            this.renderedElement.querySelector('.lightSelect__dropdown').classList.add('lightSelect__dropdown--visible');
            this.isOpened = true;

            if(this.isSearch){
                this.renderedElement.querySelector('.lightSelect__search-control').focus();
            }
        }

        hide(){
            this.renderedElement.querySelector('.lightSelect__title').classList.remove('lightSelect__title--active')
            this.renderedElement.querySelector('.lightSelect__dropdown').classList.remove('lightSelect__dropdown--visible');
            this.isOpened = false;

            if(this.isSearch){
                this.renderedElement.querySelector('.lightSelect__search-control').value = "";
            }
        }

        destroy(){
            this.element.style = "";
            this.renderedElement.remove();
            delete this.element.LightSelect;
        }

    }

    const elems = new LightSelect({
        selector: '.light-select',
        isSearch: true,
    });

    // elems.onSearchInput(function () {
    //     console.log('custom search');
    // })
});



