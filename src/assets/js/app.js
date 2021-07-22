document.addEventListener("DOMContentLoaded", function () {

    class LightSelect{
        static #elements = null;

        static setHandlers(instance){

            const {renderedElement, element} = instance;
            const title = renderedElement.querySelector('.lightSelect__title');
            const titleText = renderedElement.querySelector('.lightSelect__title-text');
            const list = renderedElement.querySelector('.lightSelect__list');
            const listItems = renderedElement.querySelectorAll('.lightSelect__list-item');
            const searchElem = renderedElement.querySelector('.lightSelect__search-control');

            title.addEventListener('click', () => {
                if(instance.isOpened){
                    instance.hide();
                } else {
                    instance.show();
                }
            });

            list.addEventListener('click', e => {
                if(e.target.classList.contains('lightSelect__list-item')){
                    instance.setValue(e.target.dataset.index);
                    instance.hide();
                }
            })

            element.addEventListener('change', () => {
                instance.setValue(element.selectedIndex);
            })

            window.addEventListener('click', () => instance.hide());
            renderedElement.addEventListener('click', (e) => e.stopPropagation());
        }

        constructor({selector, searchPanel = false}) {
            this.element = null;
            this.renderedElement = null;
            this.searchPanel = searchPanel;
            this.isOpened = false;
            this.init(selector);
        }

        init(selector){
            LightSelect.#elements = document.querySelectorAll(selector); // is necessary ?

            LightSelect.#elements.forEach(element => {

                // store an element to LightSelect instance
                this.element = element;
                this.element.style.display = 'none';

                // store an rendered element to LightSelect instance
                this.renderedElement = this.#render(this);
                this.renderedElement.LightSelect = this;


                this.setValue(this.element.selectedIndex);

                if(this.searchPanel){
                    this.onSearchInput = function(callback) {
                        const searchElem = this.renderedElement.querySelector('.lightSelect__search-control');
                        searchElem.addEventListener('input', callback);
                    }
                }

                LightSelect.setHandlers(this);
            });
        }

        #render(instance){

            const elementOptions = instance.element.querySelectorAll('option');

            const lightSelectContainer = document.createElement('div');
            lightSelectContainer.classList.add('lightSelect');
            lightSelectContainer.innerHTML = `
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

            const lightSelectTitleText = lightSelectContainer.querySelector('.lightSelect__title-text');
            const lightSelectDropdown = lightSelectContainer.querySelector('.lightSelect__dropdown');
            const lightSelectList = lightSelectContainer.querySelector('.lightSelect__list');

            elementOptions.forEach((option, index) => {

                if(option.selected){
                    lightSelectTitleText.innerHTML = option.textContent;
                }

                lightSelectList.innerHTML += `
                    <div class="lightSelect__list-item" data-selected="${option.selected}" data-value="${option.value}" data-index="${index}">${option.textContent}</div>
                `;
            })

            instance.element.after(lightSelectContainer);

            if(instance.searchPanel){
                const searchPanel = document.createElement('div');
                searchPanel.classList.add('lightSelect__search-panel');
                searchPanel.innerHTML = `<input class="lightSelect__search-control" type="text" placeholder="Поиск">`

                lightSelectDropdown.prepend(searchPanel);
            }
            return lightSelectContainer;
        }

        setValue(index){
            const listElements = this.renderedElement.querySelectorAll('.lightSelect__list-item');
            const selectedElement = listElements[+index];

            listElements.forEach(element => {
                element.classList.remove('lightSelect__list-item--selected');
                element.dataset.selected = 'false'
            });

            selectedElement.dataset.selected = 'true';
            selectedElement.classList.add('lightSelect__list-item--selected');

            this.renderedElement.querySelector('.lightSelect__title-text').textContent = selectedElement.textContent;
            this.element.selectedIndex = +index;
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

            if(this.searchPanel){
                this.renderedElement.querySelector('.lightSelect__search-control').focus();
            }
        }

        hide(){
            this.renderedElement.querySelector('.lightSelect__title').classList.remove('lightSelect__title--active')
            this.renderedElement.querySelector('.lightSelect__dropdown').classList.remove('lightSelect__dropdown--visible');
            this.isOpened = false;

            if(this.searchPanel){
                this.renderedElement.querySelector('.lightSelect__search-control').value = "";
            }
        }

    }

    const elems = new LightSelect({
        selector: '.light-select',
        searchPanel: true,
    });

    elems.onSearchInput(function () {
        console.log('custom search');
    })
});



