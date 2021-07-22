document.addEventListener("DOMContentLoaded", function () {

    class LightSelect{
        static #elements = null;

        static render(element){
            const elementOptions = element.querySelectorAll('option');

            const lightSelectContainer = document.createElement('div');
            lightSelectContainer.classList.add('lightSelect');
            lightSelectContainer.innerHTML = `
                <div class="lightSelect__title">
                    <div class="lightSelect__title-text"></div>
                    <div class="lightSelect__title-arrow"></div>
                </div>
                <div class="lightSelect__list"></div>
            `;

            const lightSelectTitleText = lightSelectContainer.querySelector('.lightSelect__title-text');
            const lightSelectList = lightSelectContainer.querySelector('.lightSelect__list');

            elementOptions.forEach((option, index) => {

                if(option.selected){
                    lightSelectTitleText.innerHTML = option.textContent;
                }

                lightSelectList.innerHTML += `
                    <div class="lightSelect__list-item" data-selected="${option.selected}" data-value="${option.value}" data-index="${index}">${option.textContent}</div>
                `;
            })

            element.after(lightSelectContainer);
            return lightSelectContainer;
        }

        static setHandlers(instance){

            const {renderedElement, element} = instance;
            const title = renderedElement.querySelector('.lightSelect__title');
            const titleText = renderedElement.querySelector('.lightSelect__title-text');
            const list = renderedElement.querySelector('.lightSelect__list');
            const listItems = renderedElement.querySelectorAll('.lightSelect__list-item');

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
            LightSelect.#elements = document.querySelectorAll(selector);

            LightSelect.#elements.forEach(element => {

                this.element = element;
                this.element.style.display = 'none';

                this.renderedElement = LightSelect.render(this.element);
                this.renderedElement.LightSelect = this;

                LightSelect.setHandlers(this)

                console.log(element.LightSelect)
            });
        }

        setValue(index){
            const selectedElement = this.renderedElement.querySelectorAll('.lightSelect__list-item')[+index]
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
            this.renderedElement.querySelector('.lightSelect__list').classList.add('lightSelect__list--visible');
            this.isOpened = true;
        }

        hide(){
            this.renderedElement.querySelector('.lightSelect__title').classList.remove('lightSelect__title--active')
            this.renderedElement.querySelector('.lightSelect__list').classList.remove('lightSelect__list--visible');
            this.isOpened = false;
        }
    }

    const elems = new LightSelect({
        selector: '.light-select'
    });
});



