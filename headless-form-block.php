<?php
/**
 * Plugin Name: Headless Form Block
 * Description: A custom Gutenberg block for creating forms in headless WordPress sites.
 * Version: 1.0.9
 * Author: Jeffrey Haug
 * Author URI: https://hozt.com
 * Text Domain: headless-form-block
 *
 * Registers a Gutenberg block that renders a server-side HTML form for use with
 * headless WordPress + Astro (astro-wp) setups. The static front-end handles
 * form submission; WordPress only provides the markup via the REST/WPGraphQL API.
 * Includes a Cloudflare Turnstile CAPTCHA placeholder (#cf-turnstile).
 *
 * @author Jeffrey Haug <https://hozt.com>
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function headless_form_block_init() {
    register_block_type( __DIR__, array(
        'render_callback' => 'headless_form_block_render_callback'
    ) );
}
add_action( 'init', 'headless_form_block_init' );

function headless_form_enqueue_editor_assets() {
    wp_enqueue_style(
        'my-block-editor-css',
        plugins_url( 'styles/editor.css', __FILE__ ),
        array( 'wp-edit-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'styles/editor.css' )
    );
}
add_action( 'enqueue_block_editor_assets', 'headless_form_enqueue_editor_assets' );

function headless_form_enqueue_frontend_assets() {
    // Only enqueue the front-end stylesheet — the editor JS is registered via
    // block.json (editorScript) and must not be loaded on the public front-end.
    wp_enqueue_style(
        'my-block-css',
        plugins_url( 'styles/style.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'styles/style.css' )
    );
}
add_action( 'enqueue_block_assets', 'headless_form_enqueue_frontend_assets' );

function headless_form_block_render_callback($attributes, $content) {
    $form_name = isset($attributes['formName']) ? $attributes['formName'] : '';
    $form_fields = isset($attributes['formFields']) ? $attributes['formFields'] : array();
    $submit_button_text = isset($attributes['submitButtonText']) ? $attributes['submitButtonText'] : 'Submit';
    $form_class = sanitize_title($form_name);
    $form_class .= ' ' . sanitize_title(get_post_field('post_name', get_the_ID()));
    $email_subject = isset($attributes['emailSubject']) ? $attributes['emailSubject'] : '';

    ob_start();
    ?>
    <form class="headless-form-block <?php echo $form_class;?>">
        <input type="hidden" name="email_subject" value="<?php echo esc_attr($email_subject); ?>">
        <?php foreach ($form_fields as $field) : ?>
            <?php $fieldClass = sanitize_title($field['name']); ?>
            <div class="form-field field-<?php echo $fieldClass;?> form-field-<?php echo esc_attr($field['type']); ?>">
                <label for="<?php echo esc_attr($field['name']); ?>">
                    <?php echo esc_html($field['label']); ?>
                    <?php if ($field['required']) echo ' <span class="required">*</span>'; ?>
                </label>
                <?php
                switch ($field['type']) {
                    case 'text':
                    case 'date':
                        echo '<input type="' . esc_attr($field['type']) . '" id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"';
                        if (!empty($field['size'])) {
                            echo ' size="' . esc_attr($field['size']) . '"';
                        }
                        if (!empty($field['maxLength'])) {
                            echo ' maxlength="' . esc_attr($field['maxLength']) . '"';
                        }
                        if ($field['required']) {
                            echo ' required';
                        }
                        echo '>';
                        break;
                    case 'hidden':
                        echo '<input type="hidden" name="' . esc_attr($field['name']) . '" value="' . esc_attr($field['value']) . '">';
                        break;
                    case 'email':
                        echo '<input type="email" id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"' . ($field['required'] ? ' required' : '') . ' size="40" maxlength="254">';
                        break;
                    case 'textarea':
                        echo '<textarea id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"';
                        if (!empty($field['rows'])) {
                            echo ' rows="' . esc_attr($field['rows']) . '"';
                        }
                        if (!empty($field['cols'])) {
                            echo ' cols="' . esc_attr($field['cols']) . '"';
                        }
                        if ($field['required']) {
                            echo ' required';
                        }
                        echo '></textarea>';
                        break;
                    case 'checkbox':
                        echo '<input type="checkbox" id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"' . ($field['required'] ? ' required' : '') . '>';
                        break;
                    case 'radio':
                        echo '<input type="radio" id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"' . ($field['required'] ? ' required' : '') . '>';
                        break;
                    case 'select':
                        echo '<select id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"' . ($field['required'] ? ' required' : '') . '>';
                        $options = explode(',', $field['options']);
                        foreach ($options as $option) {
                            echo '<option value="' . esc_attr(trim($option)) . '">' . esc_html(trim($option)) . '</option>';
                        }
                        echo '</select>';
                        break;
                    case 'password':
                        echo '<input type="password" id="' . esc_attr($field['name']) . '" name="' . esc_attr($field['name']) . '"';
                        if (!empty($field['size'])) {
                            echo ' size="' . esc_attr($field['size']) . '"';
                        }
                        if ($field['required']) {
                            echo ' required';
                        }
                        echo '>';
                        break;
                }
                ?>
            </div>
        <?php endforeach; ?>
        <div id="cf-turnstile"></div>
        <button type="submit" id="submitButton"><?php echo esc_html($submit_button_text); ?></button>
    </form>
    <?php
    return ob_get_clean();
}
