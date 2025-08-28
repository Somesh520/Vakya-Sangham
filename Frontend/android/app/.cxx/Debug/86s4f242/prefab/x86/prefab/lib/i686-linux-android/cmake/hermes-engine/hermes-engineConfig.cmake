if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/anjut/.gradle/caches/8.14.1/transforms/65f0b5da5c9a14423e8b560995351496/transformed/jetified-hermes-android-0.80.1-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/anjut/.gradle/caches/8.14.1/transforms/65f0b5da5c9a14423e8b560995351496/transformed/jetified-hermes-android-0.80.1-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

