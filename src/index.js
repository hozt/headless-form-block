// src/index.js
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button, SelectControl, CheckboxControl, TextareaControl } from '@wordpress/components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import metadata from '../block.json';

const TextFieldOptions = ({ field, updateField }) => (
    <>
        <TextControl
            label="Field Label"
            value={field.label}
            onChange={(label) => updateField({ label })}
            size={30}
        />
        <TextControl
            label="Field Name"
            value={field.name}
            onChange={(name) => updateField({ name })}
            size={30}
        />
        <TextControl
            label="Size"
            type="number"
            value={field.size || ''}
            onChange={(size) => updateField({ size: size ? parseInt(size, 10) : '' })}
            size={5}
        />
        <TextControl
            label="Max Length (optional)"
            type="number"
            value={field.maxLength || ''}
            onChange={(maxLength) => updateField({ maxLength: maxLength ? parseInt(maxLength, 10) : '' })}
            size={5}
        />
        <CheckboxControl
            label="Required"
            checked={field.required}
            onChange={(required) => updateField({ required })}
        />
    </>
);

const EmailFieldOptions = ({ field, updateField }) => (
    <>
        <TextControl
            label="Field Label"
            value={field.label}
            onChange={(label) => updateField({ label })}
            required
            size={30}
        />
        <TextControl
            label="Field Name"
            value={field.name}
            onChange={(name) => updateField({ name })}
            required
            size={30}
        />
        <CheckboxControl
            label="Required"
            checked={field.required}
            onChange={(required) => updateField({ required })}
        />
    </>
);

const HiddenFieldOptions = ({ field, updateField }) => (
    <>
        <TextControl
            label="Field Name"
            value={field.name}
            onChange={(name) => updateField({ name })}
            size={30}
            required
        />
        <TextControl
            label="Field Value"
            value={field.value}
            onChange={(value) => updateField({ value })}
            size={30}
            required
        />
    </>
);

const DateFieldOptions = ({ field, updateField }) => (
    <>
        <TextControl
            label="Field Label"
            value={field.label}
            onChange={(label) => updateField({ label })}
            size={30}
            required
        />
        <TextControl
            label="Field Name"
            value={field.name}
            onChange={(name) => updateField({ name })}
            size={30}
            required
        />
        <CheckboxControl
            label="Required"
            checked={field.required}
            onChange={(required) => updateField({ required })}
        />
    </>
);

const TextareaFieldOptions = ({ field, updateField }) => (
    <>
        <TextControl
            label="Field Label"
            value={field.label}
            onChange={(label) => updateField({ label })}
            size={30}
            required
        />
        <TextControl
            label="Field Name"
            value={field.name}
            onChange={(name) => updateField({ name })}
            size={30}
            required
        />
        <TextControl
            label="Rows"
            type="number"
            value={field.rows || ''}
            onChange={(rows) => updateField({ rows: rows ? parseInt(rows, 10) : '' })}
            size={5}
        />
        <TextControl
            label="Cols"
            type="number"
            value={field.cols || ''}
            onChange={(cols) => updateField({ cols: cols ? parseInt(cols, 10) : '' })}
            size={5}
        />
        <CheckboxControl
            label="Required"
            checked={field.required}
            onChange={(required) => updateField({ required })}
        />
    </>
);

registerBlockType(metadata.name, {
    edit: ({ attributes, setAttributes }) => {
        const { formName, formFields, submitButtonText } = attributes;

        const blockProps = useBlockProps({
            className: 'headless-form-block-editor',
        });

        const addField = () => {
            const newField = {
                id: `field-${Date.now()}`,
                type: 'text',
                label: '',
                name: '',
                size: '',
                maxLength: '',
                required: false,
                options: '',
                value: '', // for hidden fields
                rows: '', // for textarea
                cols: '', // for textarea
            };
            setAttributes({ formFields: [...formFields, newField] });
        };

        const updateField = (index, field) => {
            const updatedFields = [...formFields];
            updatedFields[index] = { ...updatedFields[index], ...field };
            setAttributes({ formFields: updatedFields });
        };

        const removeField = (index) => {
            const updatedFields = formFields.filter((_, i) => i !== index);
            setAttributes({ formFields: updatedFields });
        };

        const onDragEnd = (result) => {
            if (!result.destination) {
                return;
            }

            const newFields = Array.from(formFields);
            const [reorderedItem] = newFields.splice(result.source.index, 1);
            newFields.splice(result.destination.index, 0, reorderedItem);

            setAttributes({ formFields: newFields });
        };

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title="Form Settings">
                        <TextControl
                            label="Form Name"
                            value={formName}
                            onChange={(value) => setAttributes({ formName: value })}
                        />
                        <TextControl
                            label="Submit Button Text"
                            value={submitButtonText}
                            onChange={(value) => setAttributes({ submitButtonText: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="headless-form-preview">
                    <h3>{formName || 'Untitled Form'}</h3>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="form-fields">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {formFields.map((field, index) => (
                                        <Draggable key={field.id} draggableId={field.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`form-field-preview form-field-${field.type}`}
                                                >
                                                    <SelectControl
                                                        value={field.type}
                                                        options={[
                                                            { label: 'Text', value: 'text' },
                                                            { label: 'Email', value: 'email' },
                                                            { label: 'Textarea', value: 'textarea' },
                                                            { label: 'Checkbox', value: 'checkbox' },
                                                            { label: 'Radio', value: 'radio' },
                                                            { label: 'Select', value: 'select' },
                                                            { label: 'Hidden', value: 'hidden' },
                                                            { label: 'Date', value: 'date' }
                                                        ]}
                                                        onChange={(type) => updateField(index, { type })}
                                                    />
                                                    {field.type === 'text' && (
                                                        <TextFieldOptions
                                                            field={field}
                                                            updateField={(updates) => updateField(index, updates)}
                                                        />
                                                    )}
                                                    {field.type === 'email' && (
                                                        <EmailFieldOptions
                                                            field={field}
                                                            updateField={(updates) => updateField(index, updates)}
                                                        />
                                                    )}
                                                    {field.type === 'hidden' && (
                                                        <HiddenFieldOptions
                                                            field={field}
                                                            updateField={(updates) => updateField(index, updates)}
                                                        />
                                                    )}
                                                    {field.type === 'date' && (
                                                        <DateFieldOptions
                                                            field={field}
                                                            updateField={(updates) => updateField(index, updates)}
                                                        />
                                                    )}
                                                    {field.type === 'textarea' && (
                                                        <TextareaFieldOptions
                                                            field={field}
                                                            updateField={(updates) => updateField(index, updates)}
                                                        />
                                                    )}
                                                    {field.type === 'checkbox' && (
                                                        <>
                                                            <TextControl
                                                                label="Label"
                                                                value={field.label}
                                                                onChange={(label) => updateField(index, { label })}
                                                                required
                                                            />
                                                            <TextControl
                                                                label="Name"
                                                                value={field.name}
                                                                onChange={(name) => updateField(index, { name })}
                                                                required
                                                            />
                                                            <CheckboxControl
                                                                label="Required"
                                                                checked={field.required}
                                                                onChange={(required) => updateField(index, { required })}
                                                            />
                                                        </>
                                                    )}
                                                    {field.type === 'radio' && (
                                                        <>
                                                            <TextControl
                                                                label="Label"
                                                                value={field.label}
                                                                onChange={(label) => updateField(index, { label })}
                                                                required
                                                            />
                                                            <TextControl
                                                                label="Name"
                                                                value={field.name}
                                                                onChange={(name) => updateField(index, { name })}
                                                                required
                                                            />
                                                            <TextControl
                                                                label="Options (comma-separated)"
                                                                value={field.options}
                                                                onChange={(options) => updateField(index, { options })}
                                                                required
                                                            />
                                                            <CheckboxControl
                                                                label="Required"
                                                                checked={field.required}
                                                                onChange={(required) => updateField(index, { required })}
                                                            />
                                                        </>
                                                    )}
                                                    {field.type === 'select' && (
                                                        <>
                                                            <TextControl
                                                                label="Label"
                                                                value={field.label}
                                                                onChange={(label) => updateField(index, { label })}
                                                                required
                                                            />
                                                            <TextControl
                                                                label="Name"
                                                                value={field.name}
                                                                onChange={(name) => updateField(index, { name })}
                                                                required
                                                            />
                                                            <TextControl
                                                                label="Options (comma-separated)"
                                                                value={field.options}
                                                                onChange={(options) => updateField(index, { options })}
                                                                required
                                                            />
                                                            <CheckboxControl
                                                                label="Required"
                                                                checked={field.required}
                                                                onChange={(required) => updateField(index, { required })}
                                                            />
                                                        </>
                                                    )}
                                                    <Button isDestructive onClick={() => removeField(index)}>
                                                        Remove Field
                                                    </Button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <Button
                        isPrimary={false}
                        isSecondary={true}
                        onClick={addField}
                        className="add-field-button"
                    >
                        Add Field
                    </Button>
                    <div className="form-preview-submit">
                        <Button isPrimary disabled>
                            {submitButtonText}
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
    save: () => null,
});
