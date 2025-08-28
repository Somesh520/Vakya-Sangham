if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/anjut/.gradle/caches/8.14.1/transforms/9671b38726d372d2dc19b265895266a4/transformed/hermes-android-0.80.1-release/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/anjut/.gradle/caches/8.14.1/transforms/9671b38726d372d2dc19b265895266a4/transformed/hermes-android-0.80.1-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

