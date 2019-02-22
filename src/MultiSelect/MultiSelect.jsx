import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ArrowKeysReact from 'arrow-keys-react';
import MultiSelectDropdown from './MultiSelectDropdown';
import MultiSelectListItem from './MultiSelectListItem';
import MultiSelectFooter from './MultiSelectFooter';

const MultiSelectWrapper = styled('div')`
  position: absolute;
  min-width: 170px;
  padding: 1.25rem; /* 20px if base font-size is 16px */
  border: 1px #000 solid;
`;

const MultiSelectList = styled('ul')`
  padding-left: 0;
  list-style: none;
`;

class MultiSelect extends React.PureComponent {
  state = {
    isDropdownOpened: false,
    checkedItems: {}
  };

  constructor(props) {
    super(props);
    this.listElement = React.createRef();
    this.listItems = [];

    ArrowKeysReact.config({
      up: () => {
        const activeElementIndex = this.listItems.findIndex(item => {
          return item === document.activeElement;
        });
        this.listItems[activeElementIndex - 1] && this.listItems[activeElementIndex - 1].focus();
      },
      down: () => {
        const activeElementIndex = this.listItems.findIndex(item => {
          return item === document.activeElement;
        });
        this.listItems[activeElementIndex + 1] && this.listItems[activeElementIndex + 1].focus();
      }
    });
  }

  componentDidMount() {
    const { list } = this.props;

    this.setState({
      checkedItems: list.reduce((acc, listItem) => {
        acc[listItem.name] = listItem.checked;
        return acc;
      }, {})
    });
  }

  toggleDropdown = () => {
    const { isDropdownOpened } = this.state;

    this.setState({ isDropdownOpened: !isDropdownOpened }, () => {
      if (this.state.isDropdownOpened) {
        this.listItems[0].focus();
      }
    });
  };

  handleInputChange = event => {
    const tag = event.target.tagName;
    const target = tag === 'LABEL' ? event.target.children[0] : event.target;
    // If user used the keyboard to select the label, we need to programatically check the checkbox child.
    // Also needed to work with screen readers
    if (tag === 'LABEL') {
      target.checked = !target.checked;
    }
    const { name, checked } = target;

    this.setState(prevState => ({
      checkedItems: { ...prevState.checkedItems, [name]: checked }
    }));
  };

  resetSelections = () => {
    this.setState(prevState => ({
      checkedItems: Object.keys(prevState.checkedItems).reduce((acc, listItemName) => {
        acc[listItemName] = false;
        return acc;
      }, {})
    }));
  };

  handleApplyClick = () => {
    const { onSelectionApplied } = this.props;
    const { checkedItems } = this.state;

    onSelectionApplied(checkedItems);
  };

  render() {
    const { isDropdownOpened, checkedItems } = this.state;
    const { list, dropdownButtonText, resetButtonText, applyButtonText } = this.props;
    const { handleInputChange, handleApplyClick } = this;
    const checkedItemsQuantity = Object.keys(checkedItems).filter(itemName => checkedItems[itemName]).length;

    return (
      <>
        <MultiSelectDropdown
          className="multiselect-section-wrapper"
          text={dropdownButtonText}
          quantity={checkedItemsQuantity}
          toggleDropdown={this.toggleDropdown}
          isOpened={isDropdownOpened}
        />
        {isDropdownOpened && (
          <MultiSelectWrapper className="multiselect-section-wrapper">
            <MultiSelectList
              ref={this.listElement}
              role="listbox"
              {...ArrowKeysReact.events}
              className="multiselect-list"
            >
              {list.map((listItem, index) => {
                const { label, id, name } = listItem;
                const checked = checkedItems[name];

                return (
                  <MultiSelectListItem
                    className="multiselect-list-item"
                    label={label}
                    key={id}
                    id={id}
                    name={name}
                    handleInputChange={handleInputChange}
                    checked={checked}
                    ref={el => {
                      this.listItems[index] = el;
                      return el;
                    }}
                  />
                );
              })}
            </MultiSelectList>
            <MultiSelectFooter
              resetSelections={this.resetSelections}
              resetButtonText={resetButtonText}
              applyButtonText={applyButtonText}
              handleApplyClick={handleApplyClick}
            />
          </MultiSelectWrapper>
        )}
      </>
    );
  }
}

MultiSelect.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      checked: PropTypes.bool.isRequired
    })
  ).isRequired,
  dropdownButtonText: PropTypes.string.isRequired,
  onSelectionApplied: PropTypes.func.isRequired,
  resetButtonText: PropTypes.string.isRequired,
  applyButtonText: PropTypes.string.isRequired
};

export default MultiSelect;
