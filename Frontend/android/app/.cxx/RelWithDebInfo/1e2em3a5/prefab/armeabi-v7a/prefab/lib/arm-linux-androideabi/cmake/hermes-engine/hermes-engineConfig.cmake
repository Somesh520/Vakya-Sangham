if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/anjut/.gradle/caches/8.14.1/transforms/0a6fd2ab490af499f8771d77f904f387/transformed/jetified-hermes-android-0.80.1-release/prefab/modules/libhermes/libs/android.armeabi-v7a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/anjut/.gradle/caches/8.14.1/transforms/0a6fd2ab490af499f8771d77f904f387/transformed/jetified-hermes-android-0.80.1-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

