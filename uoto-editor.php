<?php
/*
Plugin Name: Uoto Editor
Plugin URI: https://wanderingdj.jp/
Description: A powerful editor with various plugins for enhanced writing experience.
Version: 1.0
Author: Your Name
Author URI: https://wanderingdj.jp/
License: GPL2
*/

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function uoto_editor_enqueue_scripts() {
    // Base URL for the plugin directory
    $plugin_base_url = plugin_dir_url( __FILE__ );
    error_log('Uoto Editor Plugin Base URL: ' . $plugin_base_url); // この行を追加

    // Enqueue core Uoto Editor CSS
    wp_enqueue_style(
        'uoto-editor-css',
        $plugin_base_url . 'css/uoto-editor.css',
        array(),
        '1.0',
        'all'
    );

    // Enqueue core Uoto Editor JS
    wp_enqueue_script(
        'uoto-editor-js',
        $plugin_base_url . 'js/uoto-editor.js',
        array('jquery'), // Assuming jQuery is a dependency
        '1.0',
        true // Load in footer
    );

    // Enqueue main.js (if it's part of the core functionality)
    wp_enqueue_script(
        'uoto-editor-main-js',
        $plugin_base_url . 'js/main.js',
        array('uoto-editor-js'), // Depends on uoto-editor.js
        '1.0',
        true,
        array( 'type' => 'module' ) // Load as ES Module
    );

    // --- Enqueue individual plugins --- 

    // Vertical Writing Plugin
    wp_enqueue_style(
        'uoto-vertical-writing-css',
        $plugin_base_url . 'plugins/vertical-writing-plugin/vertical-writing-plugin.css',
        array(),
        '1.0',
        'all'
    );
    wp_enqueue_script(
        'uoto-vertical-writing-js',
        $plugin_base_url . 'plugins/vertical-writing-plugin/vertical-writing-plugin.js',
        array('uoto-editor-js'), // Depends on uoto-editor.js
        '1.0',
        true,
        array( 'type' => 'module' ) // Load as ES Module
    );

    // Kakuyomu Notation Plugin
    wp_enqueue_style(
        'uoto-kakuyomu-notation-css',
        $plugin_base_url . 'plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.css',
        array(),
        '1.0',
        'all'
    );
    wp_enqueue_script(
        'uoto-kakuyomu-notation-js',
        $plugin_base_url . 'plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js',
        array('uoto-editor-js'),
        '1.0',
        true,
        array( 'type' => 'module' ) // Load as ES Module
    );

    // Plugin Manager Plugin
    wp_enqueue_style(
        'uoto-plugin-manager-css',
        $plugin_base_url . 'plugins/plugin-manager/plugin-manager.css',
        array(),
        '1.0',
        'all'
    );
    wp_enqueue_script(
        'uoto-plugin-manager-js',
        $plugin_base_url . 'plugins/plugin-manager/plugin-manager.js',
        array('uoto-editor-js'),
        '1.0',
        true,
        array( 'type' => 'module' ) // Load as ES Module
    );

    // Syntax Highlight Plugin (Prism.js and its components)
    // Note: Prism.js has multiple components. Ensure correct order if dependencies exist.
    wp_enqueue_style(
        'uoto-syntax-highlight-prism-css',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/prism.min.css',
        array(),
        '1.0',
        'all'
    );
    wp_enqueue_script(
        'uoto-syntax-highlight-prism-js',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/prism.min.js',
        array(), // No direct dependency on uoto-editor-js for Prism core
        '1.0',
        true
    );
    // Enqueue specific language components for Prism if needed
    // For example, if you use markdown and javascript highlighting:
    wp_enqueue_script(
        'uoto-syntax-highlight-prism-markdown-js',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/prism-markdown.min.js',
        array('uoto-syntax-highlight-prism-js'),
        '1.0',
        true
    );
    wp_enqueue_script(
        'uoto-syntax-highlight-prism-javascript-js',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/prism-javascript.min.js',
        array('uoto-syntax-highlight-prism-js'),
        '1.0',
        true
    );
    wp_enqueue_script(
        'uoto-syntax-highlight-prism-markup-js',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/prism-markup.min.js',
        array('uoto-syntax-highlight-prism-js'),
        '1.0',
        true
    );
    // Enqueue the syntax-highlight-plugin.js itself
    wp_enqueue_script(
        'uoto-syntax-highlight-plugin-js',
        $plugin_base_url . 'plugins/syntax-highlight-plugin/syntax-highlight-plugin.js',
        array('uoto-editor-js', 'uoto-syntax-highlight-prism-js'), // Depends on uoto-editor-js and Prism core
        '1.0',
        true,
        array( 'type' => 'module' ) // Load as ES Module
    );
}
add_action( 'wp_enqueue_scripts', 'uoto_editor_enqueue_scripts' );

// If uoto-editor is meant to be used on a specific page/post, you might need to conditionally load these scripts.
// For example, if it's used on a page with a specific template or shortcode.
// For now, we'll enqueue them globally.
