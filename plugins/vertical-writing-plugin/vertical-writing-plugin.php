<?php
/*
Plugin Name: Vertical Writing Plugin for Uoto Editor
Description: Integrates vertical writing functionality into Uoto Editor.
Version: 1.0
Author: Your Name
*/

function uoto_vertical_writing_plugin_enqueue_scripts() {
    // Enqueue CSS
    wp_enqueue_style(
        'uoto-vertical-writing-css',
        plugins_url('vertical-writing-plugin.css', __FILE__),
        array(),
        '1.0',
        'all'
    );

    // Enqueue JS
    wp_enqueue_script(
        'uoto-vertical-writing-js',
        plugins_url('vertical-writing-plugin.js', __FILE__),
        array(),
        '1.0',
        true // Load in footer
    );
}
add_action('wp_enqueue_scripts', 'uoto_vertical_writing_plugin_enqueue_scripts');
?>